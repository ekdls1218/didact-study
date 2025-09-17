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

// Dom 노드 생성
function createDom(fiber) {
  const dom =
    element.type == "TEXT_ELEMENT" // 타입이 TEXT_ELEMENT인 경우
      ? document.createTextNode("") // 텍스트 노드 생성
      : document.createElement(element.type); // element 타입으로 노드 생성

  // 노드에 element 속성 부여
  const isProperty = (key) => key !== "children"; //children 빼고 나머지 props만 골라내는 함수
  Object.keys(element.props) // props의 key 뽑기
    .filter(isProperty) // 필러팅 함수 적용
    .forEach((name) => {
      // 필터링된 속성들 돌면서 노드에 속성 부여
      dom[name] = element.props[name];
    });

  return dom;
}

// 전체 fiber 트리 DOM에 커밋
function commitRoot() {
    // 실제 DOM에 추가
    commitWork(wipRoot.child) // 루트의 첫 자식부터 시작
    wipRoot = null // 커밋이 끝나면 wipRoot 초기화
}

// 모든 노드 재귀적으로 DOM에 추가
function commitWork(fiber) {  
    if(!fiber) { // fiber가 없다면 
        return // 리턴
    }
    const domParent = fiber.parent.dom // 현재 fiber의 부모 DOM
    domParent.appendChilde(fiber.dom) // 현재 fiber의 DOM 노드를 부모에 추가

    // 재귀적으로 자식/형제자매 DOM 추가
    commitWork(fiber.child) // 현재 fiber의 자식
    commitWork(fiber.sibling) // 현재 fiber의 형제자매
}

function render(element, container) {
  wipRoot = { // 작업 중(변경 중)인 루트
    dom: container,
    props: {
      children: [element],
    },
  }

  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
  let shouldYield = false; // 작업 멈출지 말지 판단, true: 멈추기, false: 계속 진행

  while (nextUnitOfWork && !shouldYield) { // 작업이 남아 있고 && 계속 진행
    nextUnitOfWork = performUnitOfWork( // 그 다음 해야 할 작업 반환
      nextUnitOfWork
    );
    shouldYield = deadline.timeRemaining() < 1; // 브라우저 idle 시간(deadline)이 1ms도 안 남았다면 → true -> 멈추기
  }

  if(!nextUnitOfWork && wipRoot) {// 모든 작업이 끝나면
    commitRoot() // 전체 fiber 트리 DOM에 커밋
  }

  requestIdleCallback(workLoop); // 반복 실행
}

requestIdleCallback(workLoop);


function performUnitOfWork(fiber) {
  if(!fiber.dom) { // fiber에 해당하는 실제 dom 노드가 없으면
    fiber.dom = createDom(fiber) // 새로운 실제 DOM 노드 생성
  }

  const elements = fiber.props.children // 현재 fiber가 가진 children
  let index = 0 // 배열 순회 인덱스
  let prevSibling = null // 형제

  // children 배열 순회
  while (index < elements.length) { // index가 elements의 길이보다 작을 때 동안 반복
    const element = elements[index]

    const newFiber = { // 현재 element를 fiber로 변환
      type: element.type, 
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (index == 0) { 
      fiber.child = newFiber // 부모 fiber에 첫번째 자식으로 연결
    }

    prevSibling = newFiber // 형제 연결 준비
    index++ // 반복이 이어지도록 index 증가
  }

  if(fiber.child) {// 자식이 있다면 
    return fiber.child // 그 자식이 다음 작업 단위
  }

  let nextFiber = fiber // 다음 fiber 지정

  // 부모로 올라가면서 형제 찾기
  while (nextFiber) { 
    if(nextFiber.sibling) { // 형제가 있다면
      return nextFiber.sibling // 그 형제를 리턴 
    }

    nextFiber = nextFiber.parent // 없다면 부모로 올라감
  }
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
