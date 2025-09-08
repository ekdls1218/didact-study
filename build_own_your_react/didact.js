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

  return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

// 변경된 props를 이용하여 DOM노드 갱신
function updateDom(dom, prevProps, nextProps) {
    Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
​

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

    Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

// 전체 fiber트리를 DOM에 커밋
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

// 모든 노드 재귀적으로 DOM에 추가
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;

  if (
    // fiber가 PLACEMENT 태그를 가졌을 때
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    // 부모 fiber 노드에 자식 DOM 노드를 추가
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    // fiber가 DELETION 태그를 가졌을 때
    // 자식을 부모DOM에서 제거
    domParent.removeChild(fiber.dom);
  } else if (
    // fiber가 UPDATE 태그를 가졌을 때
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    // 이미 존재하는 DOM노드를 변경된 props를 이용하여 갱신
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

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
    // 이전 커밋 단계에서 DOM에 추가했던 fiber
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 동시성 모드, 렌더링 도중 끼어들 수 있도록 구현
let nextUnitOfWork = null; // 첫번째 작업 단위
let currentRoot = null; // 마지막으로 DOM에 커밋된 fiber트리
let wipRoot = null; // 작업중인 루트
let deletions = null; // 제거하고 싶은 노드 추적 배열

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
  reconcilChildren(fiber, elements);

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

// 오래된 fiber 새로운 엘리먼트로 재조정
function reconcilChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  // index가 elements배열 길이보다 작을 때 또는 오래된 fiber와 자식들이 있을 때 반복
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];

    let newFiber = null;

    // 오래된 fiber(oldFiber)와 렌더링하고 싶은 엘리먼트(element) 비교
    const sameType = oldFiber && element && element.type == oldFiber.type;

    // 같은 타입일 때
    if (sameType) {
      // DOM노드 유지, 새로운 props 업데이트
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    // 새로운 엘리먼트 존재, 다른 타입일 때
    if (element && !sameType) {
      // 새로운 DOM노드 생성
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    // 오래된 fiber 존재, 다른 타입일 때
    if (oldFiber && !sameType) {
      // 오래된 노드 제거
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    // 첫번째 자식이면
    if (index === 0) {
      // 자식으로 fiber 트리에 추가
      wipFiber.child = newFiber;
    } else {
      // 형제자매로 fiber 트리에 추가
      prevSibling.sibling = newFiber;
    }

    // 이전 형제를 생성 fiber로
    prevSibling = newFiber;
    index++;
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
