let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');
let jd = require("jsdom/lib/old-api.js");
//let jsdom = require("jsdom");



// extraction of rendering context from the RDF store

const classQuery = fs.readFileSync('ontology/class.sparql', 'UTF-8');
const fieldQuery = fs.readFileSync('ontology/field.sparql', 'UTF-8');
const subclassQuery = fs.readFileSync('ontology/subclass.sparql', 'UTF-8');

function context(store, cb) {
    store.execute(classQuery, function(err, bindings) {
        if (err) {
		    console.log(err);
            return;
        }
        
        let classes = bindings.map(function(c) {
            c.fields = {
                query: fieldQuery.replace('?class', '<' + c.uri.value + '>'),
                defer: function(bindings) {
                    let fields = bindings.map(function(f) {
                        if (!f.otherClass && f.oc) {
                            // no label, take local name
                            let uri = f.oc.value;
                            f.otherClass = {
                                value: uri.substr(uri.lastIndexOf('#') + 1),
                                id: uri
                            };
                        } else if (f.otherClass) {
                            f.otherClass.id = '#' + f.otherClass.value.toLowerCase();
                        }
                        return f;
                    });
                    return fields;
                }
            };

            c.subclasses = {
                query: subclassQuery.replace('?class', '<' + c.uri.value + '>'),
                defer: function(bindings) {
                    let subclasses = bindings.map(function(sub) {
                        sub.subclass.id = '#' + sub.subclass.value.toLowerCase();
                        return sub;
                    });
                    return subclasses;
                }
            };

            return c;
        });

        // executes SPARQL queries in a serial fashion
        // TODO clean all this?
        let call = function(classes) {
            for (i in classes) {
                let c = classes[i];
                for (key in c) {
                    if (c[key].defer) {
                        let deferred = c[key];
                        store.execute(deferred.query, function(err, bindings) {
                            if (err) {
                                console.error(err);
                                // execution stopped
                            } else {
                                c[key] = deferred.defer(bindings);
                                call(classes);
                            }
                        });
                        return;
                    }
                }
            }
            cb({ classes: classes });
        };
        call(classes);
    });
}

// class sort prior to rendering

const predefined = [
    "Thing",
    "InteractionPattern",
    "Property",
    "Action",
    "Event",
    "DataSchema",
    "Form"
];

function sort(classes) {
    classes.classes.sort(function(c1, c2) {
        let i1 = predefined.indexOf(c1.label.value);
        let i2 = predefined.indexOf(c2.label.value);
        
        if (i1 === -1) { i1 = predefined.length; }
        if (i2 === -1) { i2 = predefined.length; }
        
        return i1 - i2;
    });
    
    return classes;
}

// rendering

const vocSrc = fs.readFileSync('vocabulary.template', 'UTF-8');
const src = fs.readFileSync('index.html.template', 'UTF-8');

function render(context) {
    dust.renderSource(vocSrc, context, function(err, out) {
	
        let result = src.replace('{vocabulary.template}', out);
        fs.writeFileSync('index.html', result, 'UTF-8');
    });
}

// main function

const onto = fs.readFileSync('ontology/td.ttl', 'UTF-8');

rdf.create(function(err, store) {
    store.load('text/turtle', onto, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        
        context(store, function(classes) {
            render(sort(classes));
        });
    });
});