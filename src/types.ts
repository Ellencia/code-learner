export type Language = 'python' | 'java' | 'javascript' | 'react' | 'typescript' | 'cpp';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningMode = 'challenge' | 'learn' | 'quiz' | 'notes' | 'stats' | 'curriculum';

export interface Challenge {
  id: string;
  language: Language;
  difficulty: Difficulty;
  title: string;
  description: string;
  starterCode: string;
  hints: string[];
  completed?: boolean;
}

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: Language;
  date: string;
}

export interface WrongNote {
  id: string;
  challenge: Challenge;
  submittedCode: string;
  review: string;
  date: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Settings {
  apiKey: string;
  apiProvider: 'groq' | 'openai' | 'gemini';
  selectedLanguage: Language;
  difficulty: Difficulty;
  editorFontSize: number;
  soundEnabled: boolean;
  dailyGoal: number;
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
}

export const CURRICULUM: Record<Language, CurriculumTopic[]> = {
  python: [
    { id: 'py_vars',    title: '변수와 자료형',   description: '정수, 부동소수점, 문자열, 불리언, 타입 변환' },
    { id: 'py_control', title: '조건문과 반복문', description: 'if/elif/else, for, while, break/continue' },
    { id: 'py_func',    title: '함수',           description: 'def, 인수, 반환값, 기본값, *args/**kwargs' },
    { id: 'py_list',    title: '리스트와 딕셔너리', description: '슬라이싱, 내장 메서드, 딕셔너리 조작' },
    { id: 'py_str',     title: '문자열 처리',     description: '포맷팅, 메서드, 슬라이싱, split/join' },
    { id: 'py_class',   title: '클래스와 객체',   description: '__init__, 메서드, 상속, 캡슐화' },
    { id: 'py_error',   title: '예외처리',        description: 'try/except/finally, 커스텀 예외' },
    { id: 'py_file',    title: '파일 입출력',     description: 'open/read/write, with문, JSON 파싱' },
    { id: 'py_adv',     title: '고급 기능',       description: '데코레이터, 제너레이터, 컴프리헨션, lambda' },
  ],
  java: [
    { id: 'java_vars',   title: '변수와 자료형',  description: '기본 타입, 래퍼 클래스, 형변환' },
    { id: 'java_ctrl',   title: '제어문',         description: 'if/switch, for/while, break/continue' },
    { id: 'java_oop',    title: '클래스와 객체',  description: '생성자, 필드, 메서드, 접근제어자' },
    { id: 'java_inh',    title: '상속과 다형성',  description: 'extends, @Override, super, 추상 클래스' },
    { id: 'java_iface',  title: '인터페이스',     description: 'implements, default 메서드, 함수형 인터페이스' },
    { id: 'java_coll',   title: '컬렉션',         description: 'ArrayList, HashMap, Set, Iterator' },
    { id: 'java_stream', title: '스트림 API',     description: 'filter, map, reduce, collect' },
    { id: 'java_exc',    title: '예외처리',       description: 'try/catch/finally, throws, 커스텀 예외' },
    { id: 'java_gen',    title: '제네릭',         description: '타입 파라미터, 와일드카드, 제한된 타입' },
  ],
  javascript: [
    { id: 'js_vars',    title: 'var/let/const',  description: '스코프, 호이스팅, TDZ, const 불변성' },
    { id: 'js_func',    title: '함수와 화살표',   description: '함수 선언식/표현식, 화살표 함수, this 바인딩' },
    { id: 'js_arr',     title: '배열 메서드',     description: 'map, filter, reduce, find, forEach' },
    { id: 'js_obj',     title: '객체와 구조분해', description: '구조분해할당, 스프레드 연산자, 단축 표기' },
    { id: 'js_async',   title: '비동기 처리',     description: '콜백, Promise, async/await, 에러처리' },
    { id: 'js_closure', title: '클로저와 스코프', description: '클로저, IIFE, 모듈 패턴' },
    { id: 'js_dom',     title: 'DOM 조작',        description: 'querySelector, 이벤트, classList, 동적 생성' },
    { id: 'js_fetch',   title: 'fetch API',       description: 'HTTP 요청, JSON 파싱, 에러 핸들링' },
    { id: 'js_proto',   title: '프로토타입',      description: '프로토타입 체인, class 문법, 상속' },
  ],
  react: [
    { id: 'react_jsx',     title: 'JSX 기초',      description: 'JSX 문법, 표현식, 조건부 렌더링, 리스트' },
    { id: 'react_state',   title: 'useState',      description: '상태 관리, 불변성, 함수형 업데이트' },
    { id: 'react_effect',  title: 'useEffect',     description: '사이드 이펙트, 의존성 배열, 클린업' },
    { id: 'react_ref',     title: 'useRef',        description: 'DOM 참조, 값 보존, forwardRef' },
    { id: 'react_context', title: 'useContext',    description: 'Context API, Provider, 전역 상태' },
    { id: 'react_memo',    title: 'useMemo/useCallback', description: '메모이제이션, 렌더링 최적화' },
    { id: 'react_hook',    title: 'Custom Hook',   description: '커스텀 훅 설계, 로직 추출, 재사용' },
    { id: 'react_form',    title: '폼과 이벤트',   description: '제어 컴포넌트, onChange, onSubmit' },
    { id: 'react_router',  title: 'React Router',  description: 'BrowserRouter, Route, Link, useParams' },
  ],
  typescript: [
    { id: 'ts_basic',    title: '기본 타입',         description: 'string/number/boolean, 배열, 튜플, any/unknown' },
    { id: 'ts_iface',    title: '인터페이스와 타입', description: 'interface vs type, 확장, 선택적 속성' },
    { id: 'ts_union',    title: '유니온과 인터섹션', description: '유니온(|), 인터섹션(&), 타입 가드' },
    { id: 'ts_generic',  title: '제네릭',           description: '타입 파라미터, 제약조건, 함수/클래스 제네릭' },
    { id: 'ts_utility',  title: 'Utility Types',    description: 'Partial, Required, Pick, Omit, Record' },
    { id: 'ts_enum',     title: 'Enum과 Literal',   description: '숫자/문자열 Enum, const enum, 리터럴 타입' },
    { id: 'ts_class',    title: '클래스 타입',       description: 'public/private/protected, readonly, 추상 클래스' },
    { id: 'ts_adv',      title: '고급 타입',         description: 'Mapped Types, Conditional Types, infer' },
  ],
  cpp: [
    { id: 'cpp_basic',   title: '기본 문법',         description: '변수, 자료형, 입출력(cin/cout), 연산자' },
    { id: 'cpp_ptr',     title: '포인터와 참조자',   description: '주소, 역참조, 포인터 연산, 참조자(&)' },
    { id: 'cpp_arr',     title: '배열과 문자열',     description: '정적 배열, C-string, std::string, vector' },
    { id: 'cpp_func',    title: '함수',              description: '오버로딩, 기본값, 인라인, 재귀' },
    { id: 'cpp_class',   title: '클래스',            description: '생성자/소멸자, 접근제어자, 멤버 함수' },
    { id: 'cpp_inh',     title: '상속과 다형성',     description: '상속, virtual 함수, 순수 가상 함수' },
    { id: 'cpp_tpl',     title: '템플릿',            description: '함수/클래스 템플릿, 특수화' },
    { id: 'cpp_stl',     title: 'STL',              description: 'vector, map, set, algorithm 라이브러리' },
    { id: 'cpp_smart',   title: '스마트 포인터',     description: 'unique_ptr, shared_ptr, RAII 패턴' },
  ],
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  react: 'React',
  typescript: 'TypeScript',
  cpp: 'C++',
};

export const LANGUAGE_ICONS: Record<Language, string> = {
  python: '🐍',
  java: '☕',
  javascript: '⚡',
  react: '⚛️',
  typescript: '🔷',
  cpp: '⚙️',
};

export const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  react: 'javascript',
  typescript: 'typescript',
  cpp: 'cpp',
};
