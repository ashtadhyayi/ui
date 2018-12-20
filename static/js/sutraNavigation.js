function getSutraLinkRelative(sutraId) {
  let sutraPaada = sutraId.split(".").slice(0,2).join(".");
  return `../../pada-${sutraPaada}/${sutraId}/`;
}

function getContextSensitiveSutraLink(sutraId) {
  if (!pageSource.startsWith("vritti")) {
    return baseURL + `?sutra=${sutraId}`;
  } else {
    return getSutraLinkRelative(sutraId);
  }

}

function getSutraLinkTag(sutraId, style, preHtml, postHtml) {
  let sutraLink = "";
  if (preHtml == null) {
    preHtml = "";
  }
  if (postHtml == null) {
    postHtml = "";
  }
  return `<a href="${getContextSensitiveSutraLink(sutraId)}"  class="${style}">${preHtml} ${sutraId} ${postHtml}</a>`;
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function setSutraNavigationLinks(){
  try{
    let currentSutraPaada = sutraId.split(".").slice(0,2).join(".");
    if (sutraBasics.Previous) {
      // console.log(nextSutraPaada);
      $(prevSutraDiv).append(getSutraLinkTag(sutraBasics.Previous, "hover-white no-underline white-90 ma1", "", "<i class=\"glyphicon glyphicon-triangle-left\"></i>"));
    }
    if (sutraBasics.Next) {
      $(nextSutraDiv).append(getSutraLinkTag(sutraBasics.Next, "hover-white no-underline white-90 ma1", preHtml="<i class=\"glyphicon glyphicon-triangle-right\"></i>"));
      // console.log(nextSutraPaada);
    }
  } catch(e) {
    console.debug(e);
    console.log("Not a sutra page, probably.");
  }
}
