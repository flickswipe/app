import { JSDOM } from "jsdom";

export function makePlainText(html: string, permitAnchors = false): string {
  // remove existing whitespace
  html = html.replace(/\n/g, "");
  html = html.replace(/\r/g, "");
  html = html.replace(/\t/g, "");

  // parse html
  const { window } = new JSDOM(html);
  const insertBefore = (el: Element, node: Node) =>
    el.parentNode.insertBefore(node, el);
  const insertAfter = (el: Element, node: Node) =>
    el.parentNode.insertBefore(node, el.nextSibling);

  // add line breaks after block elements
  const blockLevelElements = [
    "address",
    "article",
    "aside",
    "blockquote",
    "details",
    "dialog",
    "dd",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "tr",
    "ul",
  ].join(", ");
  const lineBreak = window.document.createTextNode("\n");

  Array.from(window.document.querySelectorAll(blockLevelElements)).forEach(
    (el) => {
      insertBefore(el, lineBreak.cloneNode());
      insertAfter(el, lineBreak.cloneNode());
    }
  );

  // add single linbreak before br and table/tr elements
  const brElements = ["br"].join(", ");

  Array.from(window.document.querySelectorAll(brElements)).forEach((el) => {
    insertBefore(el, lineBreak.cloneNode());
  });

  // add tabs after row cell elements
  const rowElements = ["th", "td"].join(", ");
  const tab = window.document.createTextNode("\t");

  Array.from(window.document.querySelectorAll(rowElements)).forEach((el) => {
    insertAfter(el, tab.cloneNode());
  });

  // extract anchors
  let remainingString = window.document.body.innerHTML;
  const chunks: string[] = [];
  const anchors: { href: string; textContent: string }[] = [];

  if (permitAnchors) {
    const elements = window.document.querySelectorAll("a");

    // extract chunks of html that don't include anchor tags
    // remember the anchor attributes to rebuild later
    elements.forEach((a) => {
      const index = remainingString.indexOf(a.outerHTML);
      const length = a.outerHTML.length;
      const chunk = remainingString.slice(0, index);

      chunks.push(chunk);
      remainingString = remainingString.slice(index + length);

      anchors.push({
        href: a.href,
        textContent: a.textContent,
      });
    });
  }

  chunks.push(remainingString);

  // build plain text content
  let plainText = "";

  chunks.forEach((chunk, i) => {
    window.document.body.innerHTML = chunk;
    plainText += window.document.body.textContent;

    if (typeof anchors[i] !== "undefined") {
      plainText += `<a href="${anchors[i].href}">${anchors[i].textContent}</a>`;
    }
  });

  // clean up extra whitespace
  plainText = plainText.replace(/ {2,}/g, "");
  plainText = plainText
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return plainText;
}
