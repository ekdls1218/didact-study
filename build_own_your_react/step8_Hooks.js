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

// 이벤트 리스터 판단
const isEvent = key => key.startsWith("on")

// 속성 판단: children이 아니고, 이벤트 리스너가 아닐 때
const isProperty = key =>
  key !== "children" && !isEvent(key)

// 이전 props와 새 props 값 바뀌었는지 비교 
const isNew = (prev, next) => key =>
  prev[key] !== next[key]

// 삭제되는 속성인지 확인
const isGone = (prev, next) => key => !(key in next)

// DOM 업뎃 작업, props 비교
function updateDom(dom, prevProps, nextProps) {
  // 이전 이벤트 핸들러 제거
  Object.keys(prevProps)
    .filter(isEvent) // 이벤트 핸들러 필터링
    .filter( // 새로운 props에 없거나, 바뀐 이벤트 핸들러 필터링 
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      // 필터링 된 이벤트 핸들러 제거
      dom.removeEventListener( 
        eventType,
        prevProps[name]
      )
    })

  // 제거된 속성 지우기
  Object.keys(prevProps)
    .filter(isProperty) // 일반 속성 필터링
    .filter(isGone(prevProps, nextProps)) // 이전에 있지만 새 props에 없는 속성 필터링
    .forEach(name => {
      dom[name] = "" // 필터링 된 속성 값 제거
    })

  // 새 속성 추가, 속성 업뎃
  Object.keys(nextProps)
    .filter(isProperty) // 일반 속성 필터링
    .filter(isNew(prevProps, nextProps)) // props 값 비교
    .forEach(name => {
      dom[name] = nextProps[name] // 새 props 값들로 추가 및 업뎃
    })

  // 새 이벤트 핸들러 등록
  Object.keys(nextProps)
    .filter(isEvent) // 이벤트 핸들러 필터링
    .filter(isNew(prevProps, nextProps)) // props 값 비교
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener( // 추가/변경된 핸들러 등록
        eventType,
        nextProps[name]
      )
    })
}

// 전체 fiber 트리 DOM에 커밋
function commitRoot() {
  deletions.forEach(commitWork) // 노드 제거 커밋
  // 실제 DOM에 추가
  commitWork(wipRoot.child); // 루트의 첫 자식부터 시작
  currentRoot = wipRoot; // 마지막으로 DOM에 커밋된 fiber 트리
  wipRoot = null; // 커밋이 끝나면 wipRoot 초기화
}

// 모든 노드 재귀적으로 DOM에 추가
function commitWork(fiber) {
  if (!fiber) {// fiber가 없다면
    return; // 리턴
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) { // DOM노드를 가진 fiber를 찾을 때까지 반복
    domParentFiber = domParentFiber.parent; // fiber트리 상단으로 올라가기
  }
  const domParent = domParentFiber.dom; 
  
  if(fiber.effectTag === "PLACEMENT" && fiber.dom != null) { // 생성 태그를 가지면서 fiber의 dom노드가 있을 때
    domParent.appendChilde(fiber.dom); // 현재 fiber의 DOM 노드를 부모에 추가
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) { // 업뎃 태그를 가지면서 fiber의 dom노드가 있을 때
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") { // 삭제 태그일 떄
    commitDeletion(fiber, domParent); 
  }

  // 재귀적으로 자식/형제자매 DOM 추가
  commitWork(fiber.child); // 현재 fiber의 자식
  commitWork(fiber.sibling); // 현재 fiber의 형제자매
}

// 노드 제거
function commitDeletion(fiber, domParent) {
    if (fiber.dom) { // dOM노드가 있다면
        domParent.reconcileChildren(fiber.dom); // 자식을 부모 DOM에서 제거
    } else { // 없다면
        commitDeletion(fiber.child, domParent); // 자식을 넣어서 재귀적 수행
    }
}

function render(element, container) {
  wipRoot = {// 작업 중(변경 중)인 루트
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, // 마지막으로 DOM에 커밋된 fiber 트리 링크
  };

  deletions = []; // 제거 노드 배열
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
  let shouldYield = false; // 작업 멈출지 말지 판단, true: 멈추기, false: 계속 진행

  while (nextUnitOfWork && !shouldYield) {// 작업이 남아 있고 && 계속 진행
    nextUnitOfWork = performUnitOfWork(
      // 그 다음 해야 할 작업 반환
      nextUnitOfWork
    );
    shouldYield = deadline.timeRemaining() < 1; // 브라우저 idle 시간(deadline)이 1ms도 안 남았다면 → true -> 멈추기
  }

  if (!nextUnitOfWork && wipRoot) {// 모든 작업이 끝나면
    commitRoot(); // 전체 fiber 트리 DOM에 커밋
  }

  requestIdleCallback(workLoop); // 반복 실행
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function; // fiber 타입이 함수인지 체크

  if (isFunctionComponent) {// 함수형 컴포넌트일 때
    updateFunctionComponent(fiber)
  } else {// 아닐 때
    updateHostComponent(fiber)
  }

  if (fiber.child) {// 자식이 있다면
    return fiber.child; // 그 자식이 다음 작업 단위
  }

  let nextFiber = fiber; // 다음 fiber 지정

  // 부모로 올라가면서 형제 찾기
  while (nextFiber) {
    if (nextFiber.sibling) {// 형제가 있다면
      return nextFiber.sibling; // 그 형제를 리턴
    }

    nextFiber = nextFiber.parent; // 없다면 부모로 올라감
  }
}

let wipFiber = null; // 작업 중인 fiber
let hookIndex = null; // hook index

// 함수형 컴포넌트일 때
function updateFunctionComponent(fiber) {
  wipFiber = fiber; 
  hookIndex = 0;
  wipFiber.hooks = []; // 작업 중인 fiber에 hook배열 붙임
  const children = [fiber.type(fiber.props)] // 자식 요소 얻는 함수 실행
  reconcileChildren(fiber, children) 
}

function useState(initial) {
    const oldHook = 
      wipFiber.alternate && // 이전 fiber가 존재하고
      wipFiber.alternate.hooks && // 이전 fiber에 hooks배열이 존재할 때
      wipFiber.alternate.hooks[hookIndex] // 그 배열의 현재 인덱스의 훅
    const hook = { 
        state: oldHook ? oldHook.state : initial, // 이전 훅이 있다면 복사, 없거나 다르다면 매개변수로 들어온 initial
        queue: [], // setState들을 모아두는 곳
    }

    const actions = oldHook ? oldHook.queue : [] // 이전 훅이 있다면 복사, 없거나 다르다면 빈배열
    actions.forEach(action => { // 이전 렌더와 이번 렌더 사이에 발생한 setState들 실행
        hook.state = action(hook.state)
    })

    const setState = action => {
        hook.queue.push(action) // 호출 시 전달된 setState 함수를 현재 훅 큐에 넣음

        // 새 fiber 생성, 렌더링 할 준비
        wipRoot = { 
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }

        nextUnitOfWork = wipRoot // 새 렌더링 시작
        deletions = [] // 제거 노드 배열 초기화
    }

    wipFiber.hooks.push(hook) // 현재 Fiber의 훅 배열에 추가
    hookIndex++ // 다음 훅을 위한 인덱스 증가
    return [hook.state, setState] // 
}

// 일반 DOM element일 때
function updateHostComponent(fiber) {
  if (!fiber.dom) { // fiber에 해당하는 실제 dom 노드가 없으면
  fiber.dom = createDom(fiber); // 새로운 실제 DOM 노드 생성
  }

  reconcileChildren(fiber, fiber.props.children)
}

// fiber 재조정
function reconcileChildren(wipFiber, elements) {
  let index = 0; // 배열 순회 인덱스
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child; // 오래된 fiber가 있다면 그의 자식을 oldFiber로, 없다면 null
  let prevSibling = null; // 형제

  // children 배열 순회
  while (index < elements.length || oldFiber != null) {// index가 elements의 길이보다 작거나 오래된 fiber가 있을 때 동안 반복
    const element = elements[index];
    let newFiber = null;

    // oldFiber유무 && element 유무 && 오래된 fiber와 새로운 엘리먼트 타입 비교
    const sameType = oldFiber && element && element.type == oldFiber.type

    if(sameType) {// oldFiber,element가 있고, 둘이 타입이 같을 때
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }

    if (element && !sameType) {// element가 있고, 둘이 타입이 다를 때
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    
    if(oldFiber && !sameType) {// oldFiber가 있을 때
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber) // 제거 노드 배열에 추가
    }

    if(oldFiber) { // 형제 순회, 최적화가 안됐기 때문에 형제도 확인해줘야함
      oldFiber = oldFiber.sibling
    }

    if (index == 0) {
      fiber.child = newFiber; // 부모 fiber에 첫번째 자식으로 연결
    } else {
        prevSibling.sibling = newFiber // 형제자매로 연결
    }

    prevSibling = newFiber; // 형제 연결 준비
    index++; // 반복이 이어지도록 index 증가
  }
}

// React대신 만든 라이브러리
const Didact = {
  createElement,
  render,
  useState,
};

/** @jsx Didact.createElement */ // React말고 Didact를 사용하도록 바벨 사용
function Counter() {
    const[state, setState] = Didact.useState(1) 
    return (
        <h1 onClick={() => setState(c => c + 1)}>
            Count: {state}
        </h1>
    );
}

const element2 = <Counter />
const container2 = document.getElementById("root");
Didact.render(element2, container2);
