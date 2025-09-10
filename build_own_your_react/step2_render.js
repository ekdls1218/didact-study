// react 코드
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);

//--------------------------------------------------------

// 바닐라js 코드
/**
 * const element2 = React.createElement(
 *  "div",
 *  {id: "foo"},
 *  React.createElement("a", null, "bar"),
 *  React.createElement("b")
 * )
 */
function createElement(type, props, ...children) {
  // 노드 생성
  // children은 나머지 파라미터 구문
  return {
    type,
    props: {
      ...props, // 스프레드 연산자
      children: children.map(
        (
          child // children을 돌면서
        ) =>
          typeof child === "object" // 객체 타입인지 확인
            ? child // 맞으면 그대로
            : createTextElement(child) // 아니면 기본타입 노드 생성
      ),
    },
  };
}

function createTextElement(text) {
  // 기본 타입의 노드 생성
  return {
    type: "TEXT_ELEMENT", // string, number 담기
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT" // 타입이 TEXT_ELEMENT인 경우
      ? document.createTextNode("") // 텍스트 노드 생성
      : document.createElement(element.type); // element 타입으로 노드 생성

  // 노드에 element 속성 부여 
  const isProperty = (key) => key !== "children"; //children 빼고 나머지 props만 골라내는 함수
  Object.keys(element.props) // props의 key 뽑기
    .filter(isProperty) // 필러팅 함수 적용
    .forEach((name) => { // 필터링된 속성들 돌면서 노드에 속성 부여
      dom[name] = element.props[name];
    });

  // 각각의 자식들 재귀적으로 수행
  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom); // 컨테이너에 추가
}

const Didact = {
  // React대신 만든 라이브러리
  createElement,
  render,
};

/** @jsx Didact.createElement */ // React말고 Didact를 사용하도록 바벨 사용
const element2 = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

const container2 = document.getElementById("root");
Didact.render(element2, container2);
