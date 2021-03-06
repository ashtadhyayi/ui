import {addLinks, getSutraLinkRelative, getEditMePath, getGithubCreationPath} from "./sutraNavigation";
import showdown from "showdown";
import YAML from 'yaml'

var showdownConverter = new showdown.Converter();

function getEditLinkHtml(includedPageUrl) {
    // console.debug(includedPageUrl, getEditMePath(includedPageUrl));
    let url = ""
    if(includedPageUrl.includes("ashtadhyayi_com")) {
        url  = "https://github.com/ashtadhyayi-com/data/blob/master/";
    } else {
        url  = getEditMePath(includedPageUrl);
    }
    return `<a class='btn btn-secondary' href='${url}'><i class="fas fa-edit"></i></a>`    
}

function getCollapseStyle(jsIncludeJqueryElement) {
    var isCollapsed =  jsIncludeJqueryElement.hasClass("collapsed");
    var collapseStyle = "collapse show";
    // console.debug(isCollapsed);
    if (isCollapsed) {
        collapseStyle = "collapse";
    }
    return collapseStyle;
}

function getIncludePageUrl(includeElement) {
    let idBits = sutraId.split(".");
    // console.debug(includeElement.attr("urlPattern").toString());
    return includeElement.attr("urlPattern").toString().replace(/ADHYAAYA/g, idBits[0]).replace(/PAADA/g, idBits[1]).replace(/SUUTRA/g, idBits[2]);
}

async function getTextContentCard(responseHtml, includeElement) {
    let title = includeElement.attr("title");
    let resourceType = includeElement.attr("dataType");
    let includedPageUrl = includeElement.attr("urlPattern") + getSutraLinkRelative(sutraId, resourceType);
    let collapseStyle = getCollapseStyle(includeElement);

    let titleHtml = "<div class='card-title border d-flex justify-content-between'>" +
        `<div id='${title}' class="btn"><a data-toggle="collapse" href="#${title}_body" role="button" aria-expanded="true" aria-controls="${title}_body">${title}` +
        `<i class="fas fa-caret-down"></i></a> </div>` +
        `${getEditLinkHtml(includedPageUrl)}` +
        "</div>";
    var contentHtml = `<div id='${title}_body' class="card-body ${collapseStyle}">${await addLinks(responseHtml)}</div>`;
    var elementToInclude = $("<div class='included-post-content card'/>")
    elementToInclude.html(titleHtml + contentHtml);
    return elementToInclude;
}

async function getJsonContentCard(responseString, includeElement) {
    let title = includeElement.attr("title");
    let fieldName = includeElement.attr("fieldName");
    let includedPageUrl = getIncludePageUrl(includeElement);
    let collapseStyle = getCollapseStyle(includeElement);
    let responseJson = JSON.parse(responseString);
    let data = responseJson[fieldName];
    var titleHtml = "";
    titleHtml = "<div class='card-title border d-flex justify-content-between'>" +
        `<div id='${title}' class="btn"><a data-toggle="collapse" href="#${title}_body" role="button" aria-expanded="true" aria-controls="${title}_body">${title}` +
        `<i class="fas fa-caret-down"></i></a> </div>` +
        `${getEditLinkHtml(includedPageUrl)}` +
        "</div>";

    if (data === undefined) {
        console.warn(`No ${fieldName} in ${responseJson}`);
        var renderedHtml = `Error getting ${fieldName} in Json. See console.` ;
    } else {
        data = data.replace(/\r?\n/g, "\n\n").replace(/<</g, "_").replace(/>>/g, "_").replace(/##/g, "  \n").replace(/\$(\d)\$(\d)\$(\d+)/g, " ($1.$2.$3)").replace(/\$(\d)(\d)0*(\d+)/g, " ($1.$2.$3)");
        var renderedHtml = showdownConverter.makeHtml(data);
    }

    var contentHtml = `<div id='${title}_body' class="card-body ${collapseStyle}">${await addLinks(renderedHtml)}</div>`;
    var elementToInclude = $("<div class='included-post-content card'/>")
    elementToInclude.html(titleHtml + contentHtml);
    return elementToInclude;
}


async function getContentCardFromObject(responseJson, includeElement) {
    let title = includeElement.attr("title");
    let fieldName = includeElement.attr("fieldName");
    let includedPageUrl = getIncludePageUrl(includeElement);
    let collapseStyle = getCollapseStyle(includeElement);
    let data = responseJson[fieldName];
    var titleHtml = "";
    titleHtml = "<div class='card-title border d-flex justify-content-between'>" +
        `<div id='${title}' class="btn"><a data-toggle="collapse" href="#${title}_body" role="button" aria-expanded="true" aria-controls="${title}_body">${title}` +
        `<i class="fas fa-caret-down"></i></a> </div>` +
        `${getEditLinkHtml(includedPageUrl)}` +
        "</div>";

    if (data === undefined) {
        console.warn(`No ${fieldName} in ${responseJson}`);
        var renderedHtml = `Error getting ${fieldName} in Json. See console.` ;
    } else {
        data = data.replace(/\r?\n/g, "\n\n").replace(/<</g, "_").replace(/>>/g, "_").replace(/##/g, "  \n").replace(/\$(\d)\$(\d)\$(\d+)/g, " ($1.$2.$3)").replace(/\$(\d)(\d)0*(\d+)/g, " ($1.$2.$3)");
        var renderedHtml = showdownConverter.makeHtml(data);
    }

    var contentHtml = `<div id='${title}_body' class="card-body ${collapseStyle}">${await addLinks(renderedHtml)}</div>`;
    var elementToInclude = $("<div class='included-post-content card'/>")
    elementToInclude.html(titleHtml + contentHtml);
    return elementToInclude;
}

async function getMarkdownContentCard(responseHtml, includeElement) {
    let title = includeElement.attr("title");
    let includedPageUrl = getIncludePageUrl(includeElement);
    let collapseStyle = getCollapseStyle(includeElement);

    let mdContent = responseHtml.split("---").slice(2).join("\n");
    let fieldNames = includeElement.attr("fieldNames");
    // console.debug(fieldNames);
    if (fieldNames !== undefined) {
        let yamlText = responseHtml.split("---")[1];
        // console.debug(yamlText);
        let fieldData = fieldNames.split(",").map(fieldName => {
            let yamlObj = YAML.parse(yamlText);
            console.debug(fieldName, yamlObj);
            let data = yamlObj[fieldName];
            if (data !== undefined) {
                return data;
            } else {
                return "";
            }
        });
        mdContent = fieldData.join("\n\n") + "\n\n" + mdContent;
    }
    var renderedHtml = showdownConverter.makeHtml(mdContent);

    var titleHtml = "";
    titleHtml = "<div class='card-title border d-flex justify-content-between'>" +
        `<div id='${title}' class="btn"><a data-toggle="collapse" href="#${title}_body" role="button" aria-expanded="true" aria-controls="${title}_body">${title}` +
        `<i class="fas fa-caret-down"></i></a> </div>` +
        `${getEditLinkHtml(includedPageUrl)}` +
        "</div>";
    var contentHtml = `<div id='${title}_body' class="card-body ${collapseStyle}">${await addLinks(renderedHtml)}</div>`;
    var elementToInclude = $("<div class='included-post-content card'/>")
    elementToInclude.html(titleHtml + contentHtml);
    return elementToInclude;
}

async function setContentCard(responseHtml, includeElement) {
    let elementToInclude = null;
    let includedPageUrl = getIncludePageUrl(includeElement);

    let resourceType = includeElement.attr("dataType");
    if (resourceType == "json") {
        elementToInclude = await getContentCardFromObject(JSON.parse(responseHtml), includeElement);
    } else {
        if (includedPageUrl.endsWith(".txt") || resourceType == "txt") {
            elementToInclude = await getTextContentCard(responseHtml, includeElement);
        } else if (includedPageUrl.endsWith(".md")) {
            elementToInclude = await getMarkdownContentCard(responseHtml, includeElement);
        } else if (includedPageUrl.endsWith(".json")) {
            elementToInclude = await getJsonContentCard(responseHtml, includeElement);
        }
    }
    includeElement.html(elementToInclude);
}

function setMissingContentCard(error, includeElement) {
    let title = includeElement.attr("title");
    let includedPageUrl = getIncludePageUrl(includeElement);
    let collapseStyle = getCollapseStyle(includeElement);

    console.warn("An error!", error);
    var createLinkHtml = `<a class='btn btn-secondary' href='${getGithubCreationPath(includedPageUrl)}'><i class="fas fa-edit"></i></a>`;
    var titleHtml = "";
    titleHtml = "<div class='card-title border d-flex justify-content-between'>" +
        `<div id='${title}' class="btn"><a data-toggle="collapse" href="#${title}_body" role="button" aria-expanded="true" aria-controls="${title}_body">${title}` +
        `<i class="fas fa-caret-down"></i></a> </div>` +
        `${createLinkHtml}` +
        "</div>";
    var contentHtml = `<div id='${title}_body' class="card-body ${collapseStyle}">न लब्धा वृत्तिः। <a href="https://github.com/sanskrit/ashtadhyayi/issues/new">सत्यां प्रेष्यताम्।</a></div>`;
    var elementToInclude = $("<div class='included-post-content card'/>")
    elementToInclude.html(titleHtml + contentHtml);
    includeElement.html(elementToInclude);
}

async function fillJsInclude(includeElement) {
    if (includeElement.html().trim() != "") {
        console.warn("Refusing to refill element with non-empty html - ", includeElement);
        return "Already loaded";
    }
    console.info("Inserting include for ", includeElement);

    // console.debug(includedPageUrl);
    let includedPageUrl = getIncludePageUrl(includeElement);
    let ajaxResponsePromise = $.ajax(includedPageUrl);
    return ajaxResponsePromise.then((x) => {setContentCard(x, includeElement); return includeElement;}).catch((e) => setMissingContentCard(e, includeElement));
}

export default function handleIncludes() {
    if ($('.js_include').length == 0 ) { return; }
    return Promise.all($('.js_include').map(function() {
        var jsIncludeJqueryElement = $(this);
        // The actual filling happens in a separate thread!
        return fillJsInclude(jsIncludeJqueryElement);
    }));
}