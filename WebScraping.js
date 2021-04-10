const axios = require('axios');
const {
  TextManipulation
} = require('./TextManipulation');

class WebScraping {
  // FormatSymbolsIntoHTML method makes it acocount for tml tag format (<x> and </x>)
  static translator = [
    ['i', '*'],
    ['b', '**']
  ];

  static AxiosRequestArtifactRemover(text) {
    let artifacts = new Array(['&quot;', '"']);

    artifacts.forEach(x => {
      // eslint-disable-next-line no-param-reassign
      text = typeof (x) === typeof ('')
        ? TextManipulation.ReplacerAll(text, x)
        : TextManipulation.ReplacerAll(text, x[0], x[1]);
    });
    return text;
  }

  static StringIntoHTMLTags() {
    let translator = this.translator;
    for (let i = 0; i < translator.length; i++) {
      let f = translator[i][0];
      translator[i][0] = [`<${f}>`, `</${f}>`];
    }
    this.translator = translator;
  }

  static SimpleFetch(URL, pointers) {
    return axios.get(URL)
      .then((response) => {
        // eslint-disable-next-line no-undef
        return Promise.resolve(this.ExtractInfoFromHTML(response.data, pointers));
      })
      .catch((error) => {
        // eslint-disable-next-line no-undef
        return Promise.reject(error);
      });
  }

  static GetBoxBorders(inputBox, pointer) {
    // Finds the ending tag
    let symbol = pointer.split(' ')[0].substring(1);
    let startS = `<${symbol}`;
    let endS = `</${symbol}>`;

    let start = inputBox.indexOf(pointer);
    let box = inputBox.substring(start);

    let possibleStart = box.indexOf(startS, 2);
    let possibleEnd = box.indexOf(endS);

    while (!(possibleStart < possibleEnd && possibleStart > 0)) {
      possibleStart = box.indexOf(startS, possibleEnd);
      possibleEnd = box.indexOf(endS, possibleEnd + 1);
    }

    let end = possibleEnd;
    if (end !== -1) { end += start; }
    return [start, end];
  }

  static ExtractInfoFromHTML(html = '', pointers) {
    // eslint-disable-next-line no-param-reassign
    html = this.AxiosRequestArtifactRemover(html); // for this mostly $quot; => "

    function BoxOpener(box, pointer) {
      let start = 0; // BSI = box start index, gets the starting location of box
      let end = 0; // BEI = box end index, gets where the box ends
      let item = '';

      let output = [];
      while (end !== -1) {
        // Finds where the box starts and ends
        [start, end] = WebScraping.GetBoxBorders(box, pointer);
        if (start === -1) { break; } // Doesn't find start => ends

        // Seperates the box from rest of the html
        if (end === -1) {
          item = box.substring(start);
        } else { item = box.substring(start, end); }
        // Extracts the data
        output.push(item);
        // eslint-disable-next-line no-param-reassign
        box = box.substring(end);
      }
      return output;
    }

    /*
    Designed to extract information from multiple isostructural boxes
    */
    let data = [];
    BoxOpener(html, pointers[0]).forEach(x => {
      let boxData = [];
      for (let i = 1; i < pointers.length; i++) {
        let boxInsides = BoxOpener(x, pointers[i]);
        if (boxInsides.length === 1) { boxInsides = boxInsides[0]; }

        boxData.push(boxInsides);
      }
      data.push(boxData);
    });
    return data;
  }

  static ExtractInfoFromHyperLink(text) {
    // Hyperlink start and end
    let hStartT = 'href="';
    let hEndT = '</a>';

    let hStart = text.indexOf(hStartT) + hStartT.length;
    let hEnd = text.indexOf(hEndT);
    let hyperlink = hEnd === -1 ? text.slice(hStart) : text.slice(hStart, hEnd);

    let urlEnd = hyperlink.indexOf('"');
    let URL = hyperlink.slice(0, urlEnd);

    hEnd = hyperlink.length - URL.length + 1;
    hyperlink = hyperlink.slice(urlEnd);

    let descStart = hyperlink.indexOf('>') + 1;
    let desc = hyperlink.slice(descStart, hEnd);
    return [URL, desc];
  }

  static GetOnlyHyperlinkDesc(text) {
    return WebScraping.ExtractInfoFromHyperLink(text)[1];
  }

  static HyperlinklessText(text) {
    return this.ReplaceElementHTML(text, 'a', this.GetOnlyHyperlinkDesc);
  }

  static ReplaceElementHTML(text, tagName, extractor = null) {
    let cutByStart = text.split(`<${tagName}`);
    if (cutByStart.length === 1) { return text; }

    for (let i = 1; i < cutByStart.length; i++) {
      let mix = cutByStart[i].split(`</${tagName}>`);

      let extract = '';
      if (extractor != null) { extract = extractor(mix[0]); }

      cutByStart[i] = extract + mix[1];
    }
    return cutByStart.join('');
  }

  static HtmlFormattingToMarkdown(text) {
    for (let i = 0; i < this.translator.length; i++) {
      let replacee = this.translator[i][0];
      let replacement = this.translator[i][1];

      if (text.indexOf(replacee[0]) !== -1) { /* eslint-disable no-param-reassign */
        text = TextManipulation.ReplacerAll(text, replacee[0], replacement);
        text = TextManipulation.ReplacerAll(text, replacee[1], replacement);
      }/* eslint-enable no-param-reassign */
    }
    return text;
  }
}
WebScraping.StringIntoHTMLTags();

exports.WebScraping = WebScraping;
