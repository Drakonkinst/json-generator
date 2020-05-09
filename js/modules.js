const COLORS = ["", "Dark Blue", "Dark Green", "Dark Aqua", "Dark Red", "Dark Purple", "Gold", "Gray", "Dark Gray", "Blue", "Green", "Aqua", "Red", "Light Purple", "Yellow", "White", "Black", "Brown" ];
var Modules = {
    HeroTrait: {
        Data: {},
        Init: function() {
            JSONTextComponent.clearData();
            setTitle("HeroTrait Generator");
            var left = createSection().appendTo(".input-content");
            var right = createSection().appendTo(".input-content");

            createForm([
                "Name", "Id", "Category", "UniqueType", "Description", "Weight", "Icon", "Color", "IsEpic", "IsSpecial", "Titles"
            ], left);
            createForm([
                "Criteria", "VisibleCriteria"
            ], right);
        },
        Schema: [
            {
                "name": "Id",
                "type": "text",
                "default": "None",
                "onload": function() {
                    $(".text-input_name").blur(function() {
                        if($(".text-input_id").val().length <= 0) {
                            $(".text-input_id").val(toTitleCase($(".text-input_name").val()).replace(/ /g, ""));
                        }
                        updateOutput();
                    });
                },
                "tooltip": "The ID of this trait. It should be exactly the same as the file name (without the extension), and should be in CamelCase."
            },
            {
                "name": "Name",
                "type": "text",
                "default": "None",
                "tooltip": "The display name of this trait."
            },
            {
                "name": "Category",
                "type": "dropdown",
                "params": {
                    "options": ["Hatred", "Immunity", "Blessing", "Combat", "Vulnerability", "Phobia", "Mortal Weakness"]
                },
                "default": "Combat",
                "tooltip": "The trait's category."
                
            },
            {
                "name": "UniqueType",
                "label": "Unique Type",
                "type": "text",
                "tooltip": "The unique category this trait fills, if any. Heroes can only have one trait of each UniqueType."
            },
            {
                "name": "Description",
                "default": "\"None\"",
                "type": "custom",
                "tooltip": "The object's description, which appears in Hero Profile and can use formatted text.",
                "onload": (function() {
                    function addComponent(before, section) {
                        if(!before) {
                            JSONTextComponent.createComponent().appendTo(section);
                        } else {
                            JSONTextComponent.createComponent(before).appendTo(section);
                        }
                        updateOutput();
                    }

                    function getLast() {
                        // this is horrible implementation but im sleepy - we should just store the last element
                        var comp = JSONTextComponent.head();
                        while(comp && comp.next) {
                            comp = comp.next;
                        }
                        return comp;
                    }

                    return function(section) {
                        var container = $("<div>").addClass("description-container").appendTo(section);
                        createButtonInput("description", "Description", "+ Component", function() {
                            addComponent(getLast(), container);
                        }, "The object's description, which appears in Hero Profile and can use formatted text.").addClass("description-sub-input").appendTo(container);
                    }
                })()
            },
            {
                "name": "Icon",
                "type": "text",
                "tooltip": "(WIP) A reference to the .png file for this trait's display icon."
            },
            {
                "name": "Color",
                "type": "dropdown",
                "params": {
                    "options": COLORS
                },
                "tooltip": "(WIP) The background color of this trait's icon."
            },
            {
                "name": "Weight",
                "type": "number",
                "params": {
                    "min": 0,
                    "decimals": 1,
                    "step": 0.1
                },
                "tooltip": "The trait's weight, used for random selection. Average is 1.0."
            },
            {
                "name": "IsEpic",
                "label": "Epic",
                "type": "checkbox",
                "tooltip": "Whether this trait is epic or not."
            },
            {
                "name": "IsSpecial",
                "label": "Remove From Pool",
                "type": "checkbox",
                "tooltip": "True if this trait should not appear in the normal pool."
            },
            {
                "name": "Titles",
                "type": "array",
                "tooltip": "A list of comma-separated titles associated with this trait."
            },
            {
                "name": "Criteria",
                "type": "nest",
                "nest": [
                    {
                        "name": "IncludeGroups",
                        "type": "custom"
                    },
                    {
                        "name": "ExcludeGroups",
                        "type": "custom"
                    }
                ],
                "onload": function(section) {
                    createCheckboxTable(["Include", "Exclude"], ["Free", "Evil", "Man", "Hobbit", "Elf", "Dwarf", "Orc", "Beorning"], "Group Permissions").appendTo(section);
                }
            },
            {
                "name": "VisibleCriteria",
                "type": "nest",
                "nest": [
                    {
                        "name": "Followers",
                        "type": "checkbox",
                        "tooltip": "If this trait requires Followers to be visible."
                    },
                    {
                        "name": "Mount",
                        "type": "checkbox",
                        "tooltip": "If this trait requires a Mount to be visible."
                    },
                    {
                        "name": "Summoner",
                        "type": "checkbox",
                        "tooltip": "If this trait requires a Summoner to be visible."
                    },
                    {
                        "name": "MortalWeakness",
                        "label": "Mortal Weakness",
                        "type": "checkbox",
                        "tooltip": "If this trait requires Mortal Weakness to be visible."
                    },
                    {
                        "name": "Relationship",
                        "type": "dropdown",
                        "params": {
                            "options": ["", "Guardian", "Ward", "Blood Brother"]
                        },
                        "tooltip": "The required relationship this Hero must have for this trait to be visible."
                    }
                ]
            }
        ],
        Download: function() {
            downloadFile(ActiveModule.Data.Id ? ActiveModule.Data.Id : "Trait", $(".output-text").val(), "application/json");
        },
        UpdateData: function() {
            // Include/Exclude Groups
            var toCheck = ["Free", "Evil", "Man", "Hobbit", "Elf", "Dwarf", "Orc", "Beorning"];
            var toInclude = [];
            var toExclude = [];
            for(var i = 0; i < toCheck.length; i++) {
                var group = toCheck[i];
                if($(".cbt_include-" + toCheck[i].toLowerCase() + " input:checked").length) {
                    toInclude.push(group);
                }
                if($(".cbt_exclude-" + toCheck[i].toLowerCase() + " input:checked").length) {
                    toExclude.push(group);
                }
            }
            var criteria = {};
            if(toInclude.length) {
                criteria["IncludeGroups"] = toInclude;
            }
            if(toExclude.length) {
                criteria["ExcludeGroups"] = toExclude;
            }
            setData(ActiveModule.Data, "Criteria", criteria);
            
            $(".output-text").val(getData(Options.minify));

            // Description
            // This is updating late for some reason? 1 char behind
            var component = JSONTextComponent.head();
            var array = [];
            while(component) {
                elem = component.elem;
                component.data = {
                    Text: elem.find(".text-input_text").val(),
                    Color: elem.find(".dropdown-input_color").val(),
                    IsBold: elem.find(".checkbox-input_isbold").prop("checked"),
                    IsItalics: elem.find(".checkbox-input_isitalics").prop("checked")
                }
                array.push(component.data);
                component = component.next;
            };

            if(array.length == 0) {
                setData(ActiveModule.Data, "Description", '"None"');
            }
            if(array.length == 1) {
                var single = array[0];
                if(!single.Text) {
                    return;
                }
                if(!single.Color && !single.IsBold && !single.IsItalics) {
                    setData(ActiveModule.Data, "Description", '"' + single.Text + '"');
                } else {
                    setData(ActiveModule.Data, "Description", formatJsonToString(JSONTextComponent.Schema(), single, 1));
                }
            } else {
                var output = "[\n";
                var numElems = 0;
                for(var i = 0; i < array.length; i++) {
                    if(array[i] && array[i].Text) {
                        output += "\t\t" + formatJsonToString(JSONTextComponent.Schema(), array[i], 2) + "\n";
                        numElems++;
                    }
                }
                output += "\t]";
                if(numElems > 0) {
                    setData(ActiveModule.Data, "Description", output);
                }
                
            }
        }
    }
};

const JSONTextComponent = (function() {
    var head = null;
    const Schema = [
        {
            "name": "Text",
            "type": "text",
            "tooltip": "The text of this component."
        },
        {
            "name": "Color",
            "type": "dropdown",
            "params": {
                "options": COLORS
            },
            "tooltip": "The color of this component."
        },
        {
            "name": "IsBold",
            "label": "Bold",
            "type": "checkbox",
            "tooltip": "Whether this component should be bold."
        },
        {
            "name": "IsItalics",
            "label": "Italics",
            "type": "checkbox",
            "tooltip": "Whether this component should be italicized."
        }
    ]

    return class JSONTextComponent {

        static createComponent(before) {
            var newComponent = new JSONTextComponent();
            if(before) {
                before.next = newComponent;
                newComponent.prev = before;
            } else {
                head = newComponent;
            }

            var wrapper = $("<div>").addClass("description-component");
            createTextInput(Schema[0]).addClass("description-sub-input").appendTo(wrapper).on("input", updateOutput);;
            createDropdownInput(Schema[1]).addClass("description-sub-input").appendTo(wrapper).on("input", updateOutput);;
            createCheckboxInput(Schema[2]).addClass("description-sub-input").appendTo(wrapper).on("click", updateOutput);;
            createCheckboxInput(Schema[3]).addClass("description-sub-input").appendTo(wrapper).on("click", updateOutput);;
            $("<button>").text("^ DELETE ^").addClass("description-sub-input description-delete-component").click(function() {
                newComponent.delete();
            }).appendTo(wrapper);
            newComponent.elem = wrapper;

            return wrapper;
        }

        static head() {
            return head;
        }

        static clearData() {
            head = null;
        }

        static Schema() {
            return Schema;
        }

        constructor() {
            this.next = null;
            this.prev = null;
            this.elem = null;
            this.data = {
                Text: "",
                Color: "",
                IsBold: false,
                IsItalics: false
            };
        }
    
        insertNewAfter() {
            this.next = new JSONTextComponent();
        }

        delete() {
            if(this.prev) {
                this.prev.next = this.next;
            }

            if(this.next) {
                this.next.prev = this.prev;
            }

            if(this == head) {
                head = this.next;
            }

            if(this.elem) {
                this.elem.remove();
            }
            setTimeout(updateOutput, 0);
        }
    }
})();