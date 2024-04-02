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
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// DOM 노드 생성
function createDom(fiber) {
  // 타입 관리
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // props에서 children이 아닌 애들만
  const isProperty = (key) => key !== "children";
  // 키만 뽑아 배열로 반환
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      // 노드에 엘리먼트 속성 부여
      dom[name] = fiber.props[name];
    });

  return dom;
}

// 전체 fiber트리를 DOM에 커밋
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

// 모든 노드 재귀적으로 DOM에 추가
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// fiber 트리의 루트에 nextUnitOfWork 함수 설정
function render(element, container) {
  // fiber트리의 루트
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

// 동시성 모드, 렌더링 도중 끼어들 수 있도록 구현
let nextUnitOfWork = null; // 첫번째 작업 단위
let wipRoot = null; // 작업중인 루트

// deadline: 다시 브라우저에서 제어를 가져갈 때까지 얼마나 걸리는지 체크
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 다음 작업 단위 반환
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 더이상 다음 작업이 없는 경우
  if (!nextUnitOfWork && wipRoot) {
    // 전체 fiber트리를 DOM에 커밋
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 메인 스레드가 대기 상태일 때 브라우저가 콜백을 실행
requestIdleCallback(workLoop);

// fiber 기능
function performUnitOfWork(fiber) {
  // DOM에 엘리먼트 추가
  // 루트부터 작업을 시작할 떄 새로운 노드 생성 후 추가
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 각 엘리먼트의 children에 대해 fiber 생성
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  // index가 elements배열 길이보다 작을 때 반복
  while (index < elements.length) {
    const element = elements[index];

    // 새로운 fiber 생성
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // 첫번째 자식이면
    if (index === 0) {
      // 자식으로 fiber 트리에 추가
      fiber.child = newFiber;
    } else {
      // 형제자매로 fiber 트리에 추가
      prevSibling.sibling = newFiber;
    }

    // 이전 형제를 생성 fiber로
    prevSibling = newFiber;
    index++;
  }

  // 다음 작업 단위 선택
  // 자식 탐색
  if (fiber.child) {
    return fiber.children;
  }

  // 형제 자매로 이동
  let nextFiber = fiber;

  while (nextFiber) {
    // 형제자매 탐색
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 부모의 형제자매로 이동
    nextFiber = nextFiber.parent;
  }
}

const Didact = {
  createElement,
  render,
};

// jsx 사용
/**@jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

const container = document.getElementById("root");
Didact.render(element, container);
