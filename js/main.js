

// OPTIONS //
var ActiveModule = Modules.HeroTrait;
var Options = {
    minify: false,
    warnExit: false,
};

// DOM MANIPULATION //
function setTitle(name) {
    $(".input-header").html("<h3>" + name + "</h3>");
}

function clearInputs() {
    $(".input-content").empty();
}

function createButtonInput(id, text, buttonText, onClick, tooltip) {
    id = classify(id);
    var label = text;

    var elem = $("<div>").addClass("input-block");
    var labelEl = $("<label>").text(label).addClass("input-label").attr("for","button-input_" + id).appendTo(elem);
    if(tooltip) {
        labelEl.attr("title", tooltip);
    }
    $("<button>").text(buttonText).addClass("input button-input button-input_" + id).click(onClick).appendTo(elem);
    return elem;
}

function createCheckboxTable(xAxis, yAxis, title="") {
    var xHeader = "<th>" + title + "</th>";
    for(var i in xAxis) {
        xHeader += "<th>" + xAxis[i] + "</th>";
    }
    var elem = $("<table>").addClass("input-block")
        .append($("<tr>").append(xHeader));

    for(var j in yAxis) {
        var row = $("<tr>");
        $("<th>" + yAxis[j] + "</th>").appendTo(row);
        for(var k in xAxis) {
            var fullID = classify(xAxis[k]) + "-" + classify(yAxis[j]);
            var cell = $("<td>").addClass("cbt-cell cbt_" + fullID).appendTo(row);
            $("<input type='checkbox'/>").addClass("checkbox-input checkbox-input_" + classify(yAxis[j])).click(function() {
                this.checked = !this.checked;
            }).appendTo(cell);
            cell.click(function() {
                var checkbox = $(this).find(".checkbox-input");
                var isChecked = !checkbox.prop("checked");
                checkbox.prop("checked", isChecked);
                updateOutput();
            });
        }
        row.appendTo(elem);
    }

    return elem;
}

function createSection() {
    //var elem = $("<fieldset class=section section_" + classify(id) + ">");
    //$("<legend>").text(id).appendTo(elem);
    //return elem;
    return $("<fieldset class=section>");
}

function createTextInput(data) {
    var id = classify(data.name);
    var label = data.label ? data.label : data.name;
    if(data.default) {
        label += "*";
    }

    var elem = $("<div>").addClass("input-block");
    var labelEl = $("<label>").text(label).addClass("input-label").attr("for","text-input_" + id).appendTo(elem);
    if(data.tooltip) {
        labelEl.attr("title", data.tooltip);
    }
    $("<input spellcheck='false'>").attr({
        "type": "text",
        "id": "text-input_" + id
    }).addClass("input text-input text-input_" + id).appendTo(elem);
    return elem;
}

function createArrayInput(data) {
    var id = classify(data.name);
    var label = data.label ? data.label : data.name;
    if(data.default) {
        label += "*";
    }

    var elem = $("<div>").addClass("input-block");
    var labelEl = $("<label>").text(label).addClass("input-label").attr("for","array-input_" + id).appendTo(elem);
    if(data.tooltip) {
        labelEl.attr("title", data.tooltip);
    }
    $("<input spellcheck='false'>").attr({
        "type": "text",
        "id": "array-input_" + id
    }).addClass("input array-input array-input_" + id).appendTo(elem);
    return elem;
}

function createNumberInput(data) {
    var id = classify(data.name);
    var label = data.label ? data.label : data.name;
    if(data.default) {
        label += "*";
    }
    var min = data.params.min;
    var max = data.params.max;
    var step = data.params.step;

    var elem = $("<div>").addClass("input-block");
    var labelEl = $("<label>").text(label).addClass("input-label").attr("for","number-input_" + id).appendTo(elem);
    if(data.tooltip) {
        labelEl.attr("title", data.tooltip);
    }
    var input = $("<input spellcheck='false'>").attr({
        "type": "number",
        "id": "number-input_" + id,
        "step": step,
    }).addClass("input number-input number-input_" + id).appendTo(elem);
    if(min != null) {
        input.attr("min", min);
    }

    if(max != null) {
        input.attr("max", max);
    }
    return elem;
}

function createDropdownInput(data) {
    var id = classify(data.name);
    var label = data.label ? data.label : data.name;
    if(data.default) {
        label += "*";
    }
    var choices = data.params.options;

    var elem = $("<div>").addClass("input-block");
    var labelEl = $("<label>").text(label).addClass("input-label").attr("for", "dropdown-input_" + id).appendTo(elem);
    if(data.tooltip) {
        labelEl.attr("title", data.tooltip);
    }
    var select = $("<select>").addClass("input dropdown-input dropdown-input_" + id).appendTo(elem);
    for(var i in choices) {
        $("<option>").html(choices[i]).appendTo(select);
    }
    return elem;
}

function createCheckboxInput(data) {
    var id = classify(data.name);
    var label = data.label ? data.label : data.name;
    if(data.default) {
        label += "*";
    }

    var elem = $("<div>").addClass("input-block");
    var labelEl = $("<label>").text(label).addClass("input-label").attr("for","checkbox-input_" + id).appendTo(elem);
    if(data.tooltip) {
        labelEl.attr("title", data.tooltip);
    }
    $("<input type='checkbox'>").addClass("input checkbox-input checkbox-input_" + id).appendTo(elem);
    return elem;
}

// OUTPUT GENERATOR //
function getData(minify) {
    var str = formatJsonToString(ActiveModule.Schema, ActiveModule.Data, 0);
    if(minify) {
        return str.replace(/\s/g, "");
    }
    return str;
}

function formatJsonToString(schema, dataset, numTabs) {
    var str = "{";
    var first = true;
    var TAB = "";
    for(var i = 0; i < numTabs; i++) {
        TAB += "\t";
    }

    for(var k in schema) {
        var field = schema[k];
        var data = getOrDefault(dataset, field.name, field.default);

        if(data == null || (data == false && (!field.params || !field.params.keepFalse))) {
            continue;
        }

        itemStr = getOutputStr(data, field, numTabs);
        if(itemStr) {
            if(first) {
                first = false;
            } else {
                str += ",";
            }
            str += "\n" + TAB + '\t"' + field.name + '": ' + itemStr;
        }
    }

    if(str.length > 1) {
        str += "\n" + TAB + "}";
        return str;
    }
    return null;
}

function getOutputStr(data, field, numTabs=1) {
    var outputStr = "";

    if(Array.isArray(data) && data.length > 0) {
        outputStr = '[ ';
        for(var j = 0; j < data.length; j++) {
            outputStr += '"' + data[j] + '"';
            if(j != data.length - 1) {
                outputStr += ", ";
            }
        }
        outputStr += ' ]';
    } else if(typeof(data) === "string") {
        if(field.type == "custom") {
            outputStr = data; 
        } else {
            outputStr = '"' + data + '"'; 
        }
    } else if(typeof(data) === "number" || typeof(data) === "boolean") {
        if(field.params && field.params.decimals) {
            outputStr = data.toFixed(field.params.decimals);
        } else {
            outputStr += data;
        }
    } else if(typeof(data) === "object") {
        var objectStr = formatJsonToString(field.nest, data, numTabs + 1);
        if(objectStr != null) {
            outputStr += objectStr;
        }
    }
    return outputStr;
}

// UPDATING //
function updateOutput() {
    console.log("Update!");
    updateData(ActiveModule.Data, ActiveModule.Schema);
    ActiveModule.UpdateData();
    ActiveModule.UpdateData();
    // for some reason updating twice fixes something with Descriptions being lazy
    // we shall proceed to bow to the code gods
}

function updateData(data, schema) {
    var primaryInputs = $(".input-block").not(".description-sub-input");
    for(var k in schema) {
        var type = schema[k].type;
        var name = schema[k].name;
        if(type === "text") {
            setData(data, name, primaryInputs.find(".text-input_" + classify(name)).val());
        } else if(type === "number") {
            setData(data, name, parseFloat(primaryInputs.find(".number-input_" + classify(name)).val()));
        } else if(type === "dropdown") {
            setData(data, name, primaryInputs.find(".dropdown-input_" + classify(name) + " option:selected").text());
        } else if(type === "checkbox") {
            setData(data, name, primaryInputs.find(".checkbox-input_" + classify(name) + ":checked").length > 0);
        } else if(type === "object") {
            // TODO
        } else if(type === "array") {
            var array = primaryInputs.find(".array-input_" + classify(name)).val().replace(/ +/g, " ").trim().split(",");
            for(var i = array.length - 1; i >= 0; i--) {
                array[i] = array[i].trim();
                if(array[i].length <= 0) {
                    array.splice(i, 1);
                }
            }
            setData(data, name, array)
        } else if(type === "nest") {
            var dataNest = {};
            updateData(dataNest, schema[k].nest);
            setData(data, schema[k].name, dataNest);
        }
    }
}

// CONTROLS //
function copyOutput() {
    copyToClipboard($(".output-text").val());
}

function downloadOutput() {
    ActiveModule.Download();
}

function toggleMinify(el) {
    if(el.checked) {
        Options.minify = true;
    } else {
        Options.minify = false;
    }
    updateOutput();
}

function resetInput() {
    clearInputs();
    ActiveModule.Init();
}

// HELPER METHODS //
function classify(str) {
    if(str == "\t") {
        return "blob";
    }
    return str.toLowerCase().replace(/ /g, "-");
}

// copies given text to clipboard
function copyToClipboard(text) {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function downloadFile(name, contents, type) {
    type = type || "text/plain";

    var blob = new Blob([contents], {type: type});

    var link = document.createElement("a");
    link.download = name;
    link.href = window.URL.createObjectURL(blob);
    link.onclick = function(e) {
        // revokeObjectURL needs a delay to work properly
        var el = this;
        setTimeout(function() {
            window.URL.revokeObjectURL(el.href);
        }, 1500);
    };

    link.click();
    link.remove();
}

// returns 0, false, truthy value, or default value
function getOrDefault(object, key, defaultValue) {
    if(defaultValue === undefined) {
        defaultValue = null;
    }
    if(object.hasOwnProperty(key) && (object[key] || object[key] === false || object[key] === 0)) {
        return object[key];
    }
    return defaultValue;
}

function setData(data, key, value) {
    data[key] = value;
}

// INIT //
function createForm(formOrder, section) {
    for(let i in formOrder) {
        let field = formOrder[i];
        if(typeof field === "string") {
            let data;
            for(let j in ActiveModule.Schema) {
                if(ActiveModule.Schema[j].name == field) {
                    data = ActiveModule.Schema[j];
                    break;
                }
            }
            if(!data) {
                continue;
            }
            initializeDataField(data, section);
        }
        
    }
    updateOutput();
    $(".input").on("input", updateOutput);
}

function initializeDataField(data, section) {
    if(data.type === "text") {
        createTextInput(data).appendTo(section);
    } else if(data.type === "number") {
        createNumberInput(data).appendTo(section);
    } else if(data.type === "dropdown") {
        createDropdownInput(data).appendTo(section);
    } else if(data.type === "checkbox") {
        createCheckboxInput(data).appendTo(section);
    } else if(data.type === "array") {
        createArrayInput(data).appendTo(section);
    } else if(data.type === "nest") {
        for(var j in data.nest) {
            let nestedData = data.nest[j];
            initializeDataField(nestedData, section);
        }
    }
    if(data.onload) {
        data.onload(section);
    }
}

$(document).ready(function() {
    ActiveModule.Init();
    console.log("Loaded!");

    if(Options.warnExit) {
        $(window).bind("beforeunload", function() {
            return "";
        });
    }
});
