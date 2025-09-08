// React 코드
// element 정의
const element = <h1 title="foo">Hello</h1>

// 브라우저 DOM으로부터 루트 노드 얻음
const container = document.getElementById("root")

// ReactDOM 업뎃
ReactDOM.render(element, container)

//----------------------------------------------------------------

// 바닐라JS 코드
/**
/* const element2 = React.createElement(
/*     "h1",
/*     {title: "foo"},
/*     "Hello"
/* )
*/
const element2 = { // 불변 객체
    type: "h1",
    props: {
        title: "foo",
        children: "Hello",
    },
}

// 브라우저 DOM으로부터 루트 노드 얻음
const container2 = document.getElementById("root")

// ReactDOM 업뎃
// node : DOM element, element : React element
const node = document.createElement(element.type) // h1 노드 생성
node["title"] = element2.props.title // node에 title 속성 부여

// 자식 노드
const text = document.createTextNode("") // text 노드 생성
text["nodeValue"] = element2.props.children // text에 값 설정

node.appendChild(text) // h1노드에 text노드 추가
container2.appendChild(node) // container에 h1노드 추가