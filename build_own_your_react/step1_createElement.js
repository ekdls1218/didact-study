// react 코드
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);

// 바닐라js 코드
/**
 * const element2 = React.createElement(
 *  "div",
 *  {id: "foo"},
 *  React.createElement("a", null, "bar"),
 *  React.createElement("b")
 * )
 */
function createElement(type, props, ...children) { // 노드 생성
  // children은 나머지 파라미터 구문
  return {
    type,
    props: {
      ...props, // 스프레드 연산자
      children: children.map((child) => // children을 돌면서 
        typeof child === "object" ?  // 객체 타입인지 확인
          child // 맞으면 그대로
          : createTextElement(child) // 아니면 text노드 생성
      ),
    },
  };
}

function createTextElement(text) { // 기본 타입의 노드 생성
    return {
        type: "TEXT_ELEMENT", // string, number 담기
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

const Didact = { // React대신 만든 라이브러리
  createElement,
}

/** @jsx Didact.createElement */  // React말고 Didact를 사용하도록 바벨 사용
const element2 = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

const container2 = document.getElementById("root");
ReactDOM.render(element2, container2);