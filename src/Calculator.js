import { addEvent, calculate } from './utils.js';
import {
  getDisplay,
  getNumBtns,
  getSpecialBtns,
} from './services/getHTMLElements.js';

class Calculator {
  #displayElement;
  #specialBtns;
  #numBtns;

  #firstOperand;
  #operator;
  #secondOperand;

  #isEqualsActive = false;
  #isOperatorActive = false;

  constructor() {
    this.#displayElement = getDisplay();
    this.#numBtns = getNumBtns(); // { zero: HTMLElement, one: HTMLElement, two: HTMLElement ... }
    this.#specialBtns = getSpecialBtns(); // { clear: HTMLElement, plusMinus: HTMLElement, percent: HTMLElement ... }

    this.#attachListenersToNumBtns();
    this.#attachListenersToSpecialBtns();
  }

  #attachListenersToNumBtns() {
    const cb = (event) => {
      // the reason for this check is to reset the display content if one of the following expressions is true
      if (
        this.#isEqualsActive ||
        this.#isOperatorActive ||
        this.#displayElement.textContent === '0'
      ) {
        this.#isEqualsActive = false;
        this.#isOperatorActive = false;
        this.#displayElement.textContent = event.target.textContent;
      } else if (this.#displayElement.textContent.length < 10) {
        this.#displayElement.textContent += event.target.textContent;
      }
    };

    // attach event listeners to number buttons
    for (const element of Object.values(this.#numBtns)) {
      addEvent(element, 'click', cb);
    }
  }

  #attachListenersToSpecialBtns() {
    const cb = (event) => {
      // when an operator is clicked, store the display content in the 'firstOperand' field and the operator type in the 'operator' field
      this.#firstOperand = this.#displayElement.textContent;
      this.#operator = event.target.textContent;
      this.#isOperatorActive = true;
      this.#isEqualsActive = false;
    };

    // attach event listeners to operator buttons
    addEvent(this.#specialBtns.addition, 'click', cb);
    addEvent(this.#specialBtns.subtraction, 'click', cb);
    addEvent(this.#specialBtns.multiplication, 'click', cb);
    addEvent(this.#specialBtns.division, 'click', cb);

    addEvent(this.#specialBtns.dot, 'click', () => {
      // the reason for this check is to reset the display content if one of the following expressions is true
      if (this.#isEqualsActive || this.#isOperatorActive) {
        this.#isEqualsActive = false;
        this.#isOperatorActive = false;
        this.#displayElement.textContent = '0.';
      } else if (!this.#displayElement.textContent.includes('.')) {
        this.#displayElement.textContent += '.';
      }
    });

    addEvent(this.#specialBtns.percent, 'click', () => {
      if (
        this.#operator === 'x' ||
        this.#operator === '÷' ||
        this.#isEqualsActive ||
        !this.#operator
      ) {
        // divide the display content by 100
        this.#displayElement.textContent =
          Number(this.#displayElement.textContent) / 100;
      } else if (this.#operator === '+' || this.#operator === '-') {
        // divide the display content by 100 and multiply it with the first operand
        this.#displayElement.textContent =
          (Number(this.#firstOperand) *
            Number(this.#displayElement.textContent)) /
          100;
      }
    });

    addEvent(this.#specialBtns.plusMinus, 'click', () => {
      if (this.#displayElement.textContent[0] !== '-') {
        this.#displayElement.textContent =
          '-' + this.#displayElement.textContent;
      } else {
        this.#displayElement.textContent =
          this.#displayElement.textContent.slice(1);
      }
    });

    addEvent(this.#specialBtns.equals, 'click', () => {
      // if operator is missing -> exit
      if (!this.#operator) return;

      // the reason for this check is that if the equals button is clicked repeatedly, it stores the second operand and applies it to the result with the selected operator
      if (this.#isEqualsActive) {
        this.#firstOperand = this.#displayElement.textContent;

        this.#displayElement.textContent = calculate(
          Number(this.#firstOperand),
          this.#operator,
          Number(this.#secondOperand)
        );
      } else {
        this.#secondOperand = this.#displayElement.textContent;

        this.#displayElement.textContent = calculate(
          Number(this.#firstOperand),
          this.#operator,
          Number(this.#secondOperand)
        );
      }

      this.#isEqualsActive = true;
    });

    addEvent(this.#specialBtns.clear, 'click', (event) => {
      switch (event.target.textContent) {
        case 'C':
          this.#displayElement.textContent = '0';
          break;
        case 'AC':
          // reset everything
          this.#displayElement.textContent = '0';

          this.#firstOperand = null;
          this.#operator = null;
          this.#secondOperand = null;

          this.#isEqualsActive = false;
          this.#isOperatorActive = false;
          break;
      }
    });
  }
}

export default Calculator;
