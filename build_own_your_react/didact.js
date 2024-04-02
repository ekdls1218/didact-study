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

// ReactDOM.render 함수 구현, DOM 갱신과 삭제
function render(element, container) {
    // DOM 노드 생성, 타입 관리
    const dom =
        element.type === "TEXT_ELEMENT" 
        ? document.createTextNode("")
        : document.createElement(element.type)
    
    // props에서 children이 아닌 애들만
    const isProperty = key => key !== "children"
    // 키만 뽑아 배열로 반환
    Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
        // 노드에 엘리먼트 속성 부여
        dom[name] = element.props[name]
    })

    // 자식 연결, 자식들 돌며 재귀적으로 수행 -> 노드 생성 후 dom에 추가
    element.props.children.forEach(child => {
        render(child, dom)
    });

    // 컨테이너에 DOM 노드 추가
    container.appendChild(dom)
}

const Didact = {
    createElement,
    render,
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
Didact.render(element, container)