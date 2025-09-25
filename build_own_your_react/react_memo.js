import { useState } from "react";

// 컴포넌트를 받아 이전 porps와 현재 props 얕은 비교
// 같으면 기존 컴포넌트를 반환, 다르면 새로운 컴포넌트 반환
function memo(component) {
  let oldProps;
  let oldComponent;
  return (props) => {
    // 얕은비교
    // true => 기존 컴포넌트 반환
    if(shallowEqual(oldProps, props)){
      return oldComponent;
    }
    oldProps = props;
    oldComponent = component(oldProps);
    // false => 새로운 컴포넌트 반환
    return oldComponent;
  };
}

function shallowEqual(objA, objB) {
  // 객체 참조 값이 같으면 true
  if (Object.is(objA, objB)) {
    return true;
  }

  // 객체가 아니거나 null일 때 false
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // 객체 길이가 다를 때 false
  if (keysA.length !== keysB.length) {
    return false;
  }

  // 객체 키 값 비교
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      // hasOwnProperty를 사용하여 objB객체의 currentKey 유무확인
      !Object.prototype.hasOwnProperty.call(objB, currentKey) ||
      // objA[currentKey]와 objB[currentKey] 값 비교
      !Object.is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}

function App() {
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <GreetingUser name={name} />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

const GreetingUser = memo(function GreetingUser({ name }) {
  console.log("rendering");
  return (
    <div>
      <h1>Hello! {name}</h1>
    </div>
  );
})

export default App;