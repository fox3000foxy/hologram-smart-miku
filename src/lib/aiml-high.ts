/* eslint-disable no-prototype-builtins */
/* eslint-disable security/detect-non-literal-regexp */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable security/detect-object-injection */
import fs from 'fs';

import { DOMParser } from 'xmldom';

export type AimlCallback = (
  answer: string | undefined,
  wildCardArray: string[],
  input: string
) => any;

export default class AimlHigh {
  private storedVariableValues: Record<string, string> = {};
  private botAttributes: Record<string, string> = {};
  private lastWildCardValue = '';
  private wildCardArray: string[] = [];
  private domArray: any[] = [];
  private isAIMLFileLoaded = false;
  private findAnswerAttempts = 0;
  private maxFindAnswerAttempts = 10;
  private previousAnswer = '';
  private previousThinkTag = false;
  private loadedFiles: string[] = [];

  constructor(botAttributesParam: Record<string, any>, lastAnswer?: string) {
    this.botAttributes = botAttributesParam;
    if (lastAnswer !== undefined) {
      this.previousAnswer = lastAnswer;
    }
  }

  loadFiles(files: string[]) {
    this.loadedFiles = [...this.loadedFiles, ...files];
    for (const file of files) {
      const data = fs.readFileSync(file).toString();
      this.loadFromString(data);
    }
  }

  loadFromString(str: string | undefined) {
    if (str === undefined) {
      return;
    }
    const dom = new DOMParser().parseFromString(str.toString());
    this.domArray.push(dom);
    this.isAIMLFileLoaded = true;
  }

  findAnswer(clientInput: string, cb: AimlCallback) {
    if (this.isAIMLFileLoaded) {
      this.wildCardArray = [];
      let result: any = '';

      for (let i = 0; i < this.domArray.length; i++) {
        const nodes = this.cleanDom(this.domArray[i].childNodes);
        result = this.findCorrectCategory(clientInput, nodes);
        if (result) {
          break;
        }
      }

      if (result) {
        this.previousAnswer = result;
      }
      return cb(result, this.wildCardArray, clientInput);
    } else if (this.findAnswerAttempts < this.maxFindAnswerAttempts) {
      const findAnswerWrapper = (clientInput: string, cb: AimlCallback) => {
        this.findAnswerAttempts++;
        return () => {
          this.findAnswer(clientInput, cb);
        };
      };

      setTimeout(findAnswerWrapper(clientInput, cb), 1000);
    } else {
      console.log('Too many findAnswer attempts.', this.findAnswerAttempts);
      return cb(undefined, this.wildCardArray, clientInput);
    }
  }

  restartDom() {
    this.domArray = [];
    this.findAnswerAttempts = 0;
  }

  // ---------------- helper functions ----------------
  private cleanStringFormatCharacters(str: string): string {
    let cleanedStr = str.replace(/\r\n/gi, '');
    cleanedStr = cleanedStr.replace(/^\s*/, '');
    cleanedStr = cleanedStr.replace(/\s*$/, '');
    return cleanedStr;
  }

  private cleanDom(childNodes: any): any {
    for (let i = 0; i < childNodes.length; i++) {
      if (
        childNodes[i].hasOwnProperty('nodeValue') &&
        typeof childNodes[i].nodeValue === 'string'
      ) {
        if (childNodes[i].nodeValue.match(/^\s*(\r)?\n\s*$/gi)) {
          childNodes[i].parentNode.removeChild(childNodes[i]);
        }
      }
    }

    for (let j = 0; j < childNodes.length; j++) {
      if (childNodes[j].hasOwnProperty('childNodes')) {
        childNodes[j].childNodes = this.cleanDom(childNodes[j].childNodes);
      }
    }

    return childNodes;
  }

  private findCorrectCategory(clientInput: string, domCategories: any): any {
    const indexOfSetTagAmountWithWildCard = 0;

    const traverse = (categories: any): any => {
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].tagName === 'aiml') {
          return traverse(categories[i].childNodes);
        } else if (categories[i].tagName === 'category') {
          const text = traverse(categories[i].childNodes);
          const matches = this.checkIfMessageMatchesPattern(clientInput, text);
          if (matches) {
            const isMatchingThat = this.checkForThatMatching(categories[i].childNodes);
            if (isMatchingThat) {
              const t = this.findFinalTextInTemplateNode(categories[i].childNodes, domCategories, indexOfSetTagAmountWithWildCard);
              if (t) {
                return t;
              }
              break;
            }
          }
        } else if (categories[i].tagName === 'pattern') {
          const text = this.resolveChildNodesInPatternNode(categories[i].childNodes);
          return text;
        }
      }
    };

    return traverse(domCategories);
  }

  private checkForThatMatching(categoryChildNodes: any): boolean {
    for (let i = 0; i < categoryChildNodes.length; i++) {
      if (categoryChildNodes[i].tagName === 'that') {
        if (categoryChildNodes[i].childNodes[0].nodeValue != this.previousAnswer) {
          return false;
        } else {
          return true;
        }
      }
    }
    return true;
  }

  private resolveChildNodesInPatternNode(patternChildNodes: any): string {
    let text = '';
    for (let i = 0; i < patternChildNodes.length; i++) {
      if (patternChildNodes[i].tagName === 'bot') {
        text =
          text +
          (this.botAttributes[patternChildNodes[i].getAttribute('name')] || '').toUpperCase();
      } else if (patternChildNodes[i].tagName === 'get') {
        text =
          text + (this.storedVariableValues[patternChildNodes[i].getAttribute('name')] || '').toUpperCase();
      } else if (patternChildNodes[i].tagName === 'set') {
        text = text + patternChildNodes[i].childNodes[0].nodeValue;
      } else {
        text = text + patternChildNodes[i].nodeValue;
      }
    }
    return text;
  }

  private findFinalTextInTemplateNode(childNodesOfTemplate: any, domCategories: any, indexOfSetTagAmountWithWildCard: number): any {
    for (let i = 0; i < childNodesOfTemplate.length; i++) {
      const node = childNodesOfTemplate[i];
      // eslint-disable-next-line no-useless-assignment
      let text = '';
      switch (node.tagName) {
        case 'template':
          return this.findFinalTextInTemplateNode(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
        case 'condition':
          return this.resolveSpecialNodes(childNodesOfTemplate, domCategories, indexOfSetTagAmountWithWildCard);
        case 'random':
          return this.resolveSpecialNodes(childNodesOfTemplate, domCategories, indexOfSetTagAmountWithWildCard);
        case 'srai': {
          const sraiText = '' +
            this.findFinalTextInTemplateNode(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
          const t = this.findCorrectCategory(sraiText, domCategories);
          return t;
        }
        case 'li':
          return this.findFinalTextInTemplateNode(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
        case 'br':
          return this.resolveSpecialNodes(childNodesOfTemplate, domCategories, indexOfSetTagAmountWithWildCard);
        case 'pattern':
          this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
          continue;
        case 'think':
        case 'bot':
        case 'set':
        case 'get':
        case 'sr':
        case 'star':
          return this.resolveSpecialNodes(childNodesOfTemplate, domCategories, indexOfSetTagAmountWithWildCard);
        case 'that':
          break;
        default:
          text = this.resolveSpecialNodes(childNodesOfTemplate, domCategories, indexOfSetTagAmountWithWildCard);
          if ((text.match('[\n|\t]*[^A-Z|^a-z|^!|^?]*')![0] === '') && (text.indexOf('function ()') === -1)) {
            return text;
          }
      }
    }
  }

  private resolveSpecialNodes(innerNodes: any, domCategories: any, indexOfSetTagAmountWithWildCard: number): any {
    let text = '';
    for (let i = 0; i < innerNodes.length; i++) {
      const node = innerNodes[i];
      switch (node.tagName) {
        case 'bot':
          text += this.botAttributes[node.getAttribute('name')];
          break;
        case 'get':
          {
            const getAux = this.storedVariableValues[node.getAttribute('name')];
            text += getAux === undefined ? '' : getAux;
          }
          break;
        case 'set':
          {
            // eslint-disable-next-line no-useless-assignment
            let aux = '';
            const nameAttribute = node.getAttribute('name');
            if (node.childNodes[0].tagName === 'star') {
              aux = this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
              this.storedVariableValues[nameAttribute] = aux;
              if (!this.previousThinkTag) {
                text += aux;
              }
            } else if (
              node.childNodes[0].nodeValue === '*' ||
              node.childNodes[0].nodeValue === '_'
            ) {
              this.storedVariableValues[nameAttribute] =
                this.wildCardArray[indexOfSetTagAmountWithWildCard];
              indexOfSetTagAmountWithWildCard++;
            } else {
              this.storedVariableValues[nameAttribute] = node.childNodes[0].nodeValue;
            }

            if (this.previousThinkTag) {
              this.previousThinkTag = false;
              text += '';
            } else {
              text += this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
            }
          }
          break;
        case 'uppercase':
          text += this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard).toUpperCase();
          return text;
        case 'lowercase':
          text += this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard).toLowerCase();
          break;
        case 'sentence':
          {
            const formalText = this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
            text += formalText.charAt(0).toUpperCase() + formalText.slice(1);
          }
          break;
        case 'formal':
          {
            const formalText = this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
            text += formalText
              .split(' ')
              .map((str: string) => str.charAt(0).toUpperCase() + str.slice(1))
              .join(' ');
          }
          break;
        case 'br':
          text += '\n';
          break;
        case 'think':
          this.previousThinkTag = true;
          text += this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
          break;
        case 'sr':
          {
            let result: any;
            for (let j = 0; j < this.domArray.length; j++) {
              result = this.findCorrectCategory(this.lastWildCardValue, this.domArray[j].childNodes);
              if (result) {
                text += result;
                break;
              }
            }
          }
          break;
        case 'random':
          {
            const randomSeed = ((s: number) => {
              s = Math.sin(s) * 10000;
              return s - Math.floor(s);
            })(Math.random());
            const randomNumber = Math.floor(randomSeed * node.childNodes.length);
            text += this.findFinalTextInTemplateNode([node.childNodes[randomNumber]], domCategories, indexOfSetTagAmountWithWildCard);
          }
          break;
        case 'star':
          text += this.lastWildCardValue;
          break;
        case 'srai':
          {
            const sraiText = '' + this.findFinalTextInTemplateNode(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
            text += this.findCorrectCategory(sraiText, domCategories);
          }
          break;
        case 'condition':
          if (!node.hasAttribute('name')) {
            if (node.childNodes.length == 0) {
              return undefined;
            }
            let child: any;
            for (const c in node.childNodes) {
              child = node.childNodes[c];
              if (child.tagName === 'li') {
                if (
                  !child.hasAttribute('value') ||
                  this.storedVariableValues[child.getAttribute('name')] === child.getAttribute('value')
                ) {
                  return this.findFinalTextInTemplateNode(child.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
                }
              }
            }
          } else if (node.hasAttribute('value')) {
            if (this.storedVariableValues[node.getAttribute('name')] === node.getAttribute('value')) {
              text += this.resolveSpecialNodes(node.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
            }
          } else if (node.childNodes.length > 0) {
            let child: any;
            for (const c in node.childNodes) {
              child = node.childNodes[c];
              if (child.tagName === 'li') {
                if (
                  !child.hasAttribute('value') ||
                  this.storedVariableValues[node.getAttribute('name')] === child.getAttribute('value')
                ) {
                  return this.resolveSpecialNodes(child.childNodes, domCategories, indexOfSetTagAmountWithWildCard);
                }
              }
            }

            return undefined;
          }
          break;
        case undefined:
          text += node.nodeValue;
          break;
        default:
          text += node.toString();
      }
    }

    text = this.cleanStringFormatCharacters(text);
    return text;
  }

  private checkIfMessageMatchesPattern(userInput: string, patternText: string): boolean {
    const regexPattern = this.convertWildcardToRegex(patternText);

    if (userInput.charAt(0) != ' ') {
      userInput = ' ' + userInput;
    }

    const lastCharacterPosition = userInput.length - 1;
    const lastCharacter = userInput.charAt(lastCharacterPosition);
    if (lastCharacter != ' ') {
      userInput = userInput + ' ';
    }

    const matchedString = userInput.toUpperCase().match(regexPattern);
    if (matchedString) {
      if (
        matchedString[0].length >= userInput.length ||
        regexPattern.source.indexOf('[A-Z|0-9|\\s]*[A-Z|0-9|-]*[A-Z|0-9]*[!|.|?|\\s]*') > -1
      ) {
        return true;
      }
    } else {
      return false;
    }
    return false;
  }

  private convertWildcardToRegex(text: string): RegExp {
    let modifiedText = text;
    const firstCharacter = text.charAt(0);
    if (firstCharacter != '*' && firstCharacter != '_') {
      modifiedText = ' ' + modifiedText;
    }
    const lastCharacterPosition = modifiedText.length - 1;
    const lastCharacter = modifiedText.charAt(lastCharacterPosition);

    modifiedText = modifiedText.replace(' _', '*').replace(' *', '*');
    modifiedText = modifiedText.replace(/\*/g, '[A-Z|0-9|\\s]*[A-Z|0-9|*|-]*[A-Z|0-9]*[!|.|?|\\s]*');

    if (lastCharacter != '*') {
      modifiedText = modifiedText + '[\\s|?|!|.]*';
    }

    return new RegExp(modifiedText);
  }

}
