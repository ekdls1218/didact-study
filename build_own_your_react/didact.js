// 리액트 코드 -> js 코드
/**
 * 리액트 코드
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)

// jxs -> js, createElement함수를 호출하여 엘리먼트 생성
const element = React.createElement(
    "div", 
    {id: "foo"}, 
    React.createElement("a", null, "bar"),
    React.createElement("b")
)

const container = document.getElementById("root")
ReactDOM.render(element, container)
 */

// 엘리먼트 객체 생성
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

// children이 객체가 아닌 기본 타입의 값(string, number)일 때
function createTextElement (text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

const Didact = {
    createElement,
}

// jsx 사용
/**@jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)

const container = document.getElementById("root")
ReactDOM.render(element, container)