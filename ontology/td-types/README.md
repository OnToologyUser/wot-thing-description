# TD Data Schema Definition

The following terms are defined in an RDFS vocabulary that conceptually aligns with JSON Schema.
See [td-types.ttl](./td-types.ttl).

Schema definitions can also be derived as OWL classes. An experimental JS script is available
[here](https://github.com/vcharpenay/wot/tree/master/proposals/type-system/schema2owl.js).

| RDF Term | JSON Schema | Comment |
| --- | --- | --- |
| rdf:type | type | |
| td:DataSchema | - | schema definition |
| td:DataField | - | object key/value pair |
| td:Object | object | |
| td:Array | array | |
| td:Number | number | ~ union of xsd:decimal, xsd:float, xsd:double |
| td:Integer | integer | ~ xsd:decimal |
| td:String | string | ~ xsd:string |
| td:Boolean | boolean | ~ xsd:boolean |
| td:item | items | |
| td:minItems | minItems | |
| td:maxItems | maxItems | |
| td:enum |enum | |
| td:field | properties | |
| td:name | - | |
| td:value | - | |
| td:required | required | |
| td:anyOf | anyOf | |
| td:someOf | someOf | |
| td:oneOf | oneOf | |
| xsd:minInclusive | minimum | |
| xsd:maxInclusive | maximum | |

## Examples

The following examples were first presented in issue #13 (as JSON schema definitions).

Door state (see also [Turtle](./ex-door.ttl)):
```json
{
    "type": "object",
    "description": "Whether a door is open or closed",
    "field": [
        {
            "name": "door",
            "schema": {
                "enum": ["Open", "Closed"]
            }
        }
    ]
}
```

Humidity value (see also [Turtle](./ex-humidity.ttl)):
```json
{
    "type": "object",
    "description": "Humidity as a percentage",
    "field": [
        {
            "name": "humidity",
            "schema": {
                "type": "number",
                "minimum": 0,
                "maximum": 100
            }
        }
    ]
}
```

Supported device modes (see also [Turtle](./ex-modes.ttl)):
```json
{
    "type": "object",
    "description": "Collection of modes supported by a device",
    "field": [
        {
            "name": "supportedModes",
            "item": { "type": "string" }
        }
    ]
}
```

Sensor reading (see also [Turtle](./ex-reading.ttl)):
```json
{
    "type": "object",
    "description": "Generic sensor reading",
    "field": [
        {
            "name": "reading",
            "schema": {
                "anyOf": [
                    { "type": "number" },
                    { "type": "string" }
                ]
            }
        }
    ]
}
```

Binary switch (see also [Turtle](./ex-switch.ttl)):
```json
{
    "type": "object",
    "description": "An on/off power switch",
    "field": [
        {
            "name": "on",
            "schema": {
                "type": "integer"
            }
        }
    ]
}
```

Weather station (see also [Turtle](./ex-weather.ttl)):
```json
{
    "type": "object",
    "description": "Weather station",
    "field": [
        {
            "name": "wind",
            "schema": {
                "type": "object",
                "field": [
                    {
                        "name": "speed",
                        "schema": { "type": "number" }
                    },
                    {
                        "name": "direction",
                        "schema": { "type": "integer" }
                    }
                ]
            }
        },
        {
            "name": "temperature",
            "schema": { "type": "number" }
        },
        {
            "name": "humidity",
            "schema": { "type": "integer" }
        }
    ]
}
```