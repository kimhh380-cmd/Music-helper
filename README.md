# 악기 코드 도감

일렉기타·피아노·베이스의 코드 사전, 키별 코드, 스케일 도감, 리프 만들기가 들어 있는 연습 웹 앱이에요.
처음 화면에서 악기를 고르면 네 가지 기능을 그 악기에 맞게 쓸 수 있어요.
휴대폰 홈 화면에 아이콘으로 설치할 수 있고, 한 번 열면 인터넷이 없어도 켜져요.

## 올리는 방법 (GitHub Pages, 무료)

1. 이 폴더의 파일을 **전부** GitHub 저장소에 올려요. (저장소 → Add file → Upload files → 파일 전체 선택 → Commit changes)
   이미 예전 버전을 올렸다면 같은 이름의 파일은 덮어쓰면 돼요.
2. Settings → Pages → Source: **Deploy from a branch**, Branch: **main / (root)** → Save
3. 2~3분 뒤 `https://내아이디.github.io/저장소이름/` 으로 열려요.

## 휴대폰에 설치

- 안드로이드(크롬): 메뉴(⋮) → **앱 설치** 또는 **홈 화면에 추가**
- 아이폰(사파리): 공유 버튼 → **홈 화면에 추가**

## 고치거나 기능 추가하기

파일을 고쳐 GitHub에 다시 올리면 사이트와 설치된 앱에 자동으로 반영돼요.

| 파일 | 내용 |
|---|---|
| `index.html` | 처음 화면(악기 고르기), 탭 구성 |
| `style.css` | 색, 글꼴, 크기 (`:root`의 색 변수만 바꿔도 전체 색이 바뀌어요) |
| `theory.js` | 음 이름, 코드 종류(`QUALITIES`), 키, 스케일(`SCALES`), 코드 진행 해석 |
| `instruments.js` | **악기 설정**: 악기마다 필터, 카드 모양, 주법별 추천(`styleGroups`), 리프 주법 목록, 스케일 그림 |
| `fretted.js` | 기타·베이스 운지 계산, 대표 운지(`GUITAR_OPEN`, `GUITAR_SHAPES`, `BASS_SHAPES`), 지판 그림 |
| `piano.js` | 피아노 누르는 법 계산(한 손·양손·전위·셸), 건반 그림 |
| `riff-rules.js` | 리프 규칙: 기타 스트로크 패턴(`STRUM_PATTERNS`), 악기별 주법 |
| `sound.js` | 악기별 소리 합성, 리버브, 녹음 파일, 반복 재생 |
| `ui-common.js`, `tab-*.js`, `main.js` | 화면 그리기와 탭 전환 |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | 앱 설치·오프라인, 앱 이름과 아이콘 |

**예시**
- 기타 스트로크 패턴 추가: `riff-rules.js`의 `STRUM_PATTERNS`에 한 줄 추가 (`D` 다운, `U` 업, `.` 쉼)
- 스케일 추가: `theory.js`의 `SCALES`에 한 줄 추가
- 새 악기(예: 우쿨렐레): `instruments.js`에 기타와 같은 모양으로 설정을 추가하고, `index.html` 처음 화면에 버튼을 하나 추가
