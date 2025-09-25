# Didact – Build Your Own React

이 프로젝트는 ["Build your own React"](https://bluewings.github.io/build-your-own-react/) 튜토리얼을 참고하여 **React 내부 동작 원리를 학습**하기 위해 직접 구현한 코드입니다.  
제가 이해한 내용을 바탕으로 주석과 설명을 추가했습니다.

## 코드 실행
👉 [Codesandbox – Didact Study](https://codesandbox.io/p/sandbox/didact-study-6cs59l)

---

## Step별 구현 요약

| 단계 | 주요 구현 | 핵심 개념 |
|------|------------|------------|
| **Step 1 – createElement** | JSX → JS 객체로 변환 (`type`, `props`, `children`) | Virtual DOM의 기본 구조 이해 |
| **Step 2 – render** | 가상 DOM을 실제 DOM으로 변환 | 트리 순회, DOM 생성 |
| **Step 3 – Concurrent Mode** | `requestIdleCallback`으로 작업 분할 | 브라우저 idle time 활용, 렌더링 비동기화 |
| **Step 4 – Fiber 구조** | 각 element를 Fiber로 구조화 (`child`, `sibling`, `parent`) | 렌더 단위 세분화, 스케줄링 기반 구조 |
| **Step 5 – Render & Commit 분리** | 렌더 단계와 커밋 단계 분리 | 미완성 UI 방지, 안정적인 DOM 반영 |
| **Step 6 – Reconciliation** | 이전 Fiber와 새 Element 비교(diff) | `UPDATE`, `PLACEMENT`, `DELETION` 처리 |
| **Step 7 – Function Components** | 함수형 컴포넌트 렌더링 구현 | `fiber.type`이 함수일 경우 처리 |
| **Step 8 – Hooks (useState)** | 상태 관리 및 재렌더링 트리거 구현 | 훅 인덱스 관리, 상태 큐 기반 구조 |

---

## 궁금증을 해결하며 배운 점

| 주제 | 핵심 이해 |
|------|------------|
| **가상 DOM을 왜 거치는가?** | JSX → 객체 → DOM으로 변환하는 과정은 결과가 같지만, **가상 DOM을 거치면 이전 구조와 새 구조를 비교(diff)** 하여 바뀐 부분만 실제 DOM에 반영할 수 있음. → 성능 최적화와 선언적 UI 구현의 핵심. |
| **렌더링은 왜 중단 가능할까?** | React는 렌더 단계(render)와 커밋 단계(commit)를 분리. 렌더 단계는 DOM을 건드리지 않기 때문에 중단해도 UI가 깨지지 않음. 커밋 단계에서만 실제 DOM 업데이트가 이루어짐. |
| **performUnitOfWork는 어떻게 동작하나?** | 각 Fiber 단위로 DOM을 생성하고, 자식 Fiber들을 연결한 뒤 **child → sibling → parent** 순서로 다음 작업을 찾음. 한 번에 하나씩 처리하며, 전체 트리를 깊이우선탐색(DFS) 방식으로 순회함. |
| **setState는 왜 비동기처럼 보이나?** | `setState`는 즉시 상태를 바꾸지 않고 **업데이트를 예약**함. 다음 렌더 사이클에서 queue에 쌓인 action들이 실행되고, commit 단계에서 DOM이 갱신됨. 브라우저가 이를 매우 빠르게 처리하기 때문에 “즉시 반영된 것처럼” 보임. |

---

## Didact vs React

| 구분 | Didact | React |
|------|--------|--------|
| 렌더 단계 | 모든 Fiber 순회 | 변하지 않은 서브트리 건너뜀 |
| 커밋 단계 | 모든 Fiber 순회 | 변경된 Fiber만 순회 |
| Fiber 생성 | 매번 새 객체 생성 | 기존 Fiber 재사용 |
| 스케줄링 | 단순 루프 기반 | 우선순위 기반 scheduler |
| 최적화 | 없음 | 다양한 성능 최적화 내장 |

---

## 참고 자료
- ["Build your own React"](https://bluewings.github.io/build-your-own-react/)  
- [React 공식 문서 (구버전)](https://ko.legacy.reactjs.org/docs/components-and-props.html)  
- [React 공식 문서 (최신)](https://ko.react.dev/learn)

