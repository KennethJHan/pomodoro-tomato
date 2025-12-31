# 🍅 Pomodoro Timer

내가 쓰려고 직접 만든 심플하고 아름다운 포모도로 타이머.

## 기능

- ⏱️ **25분 작업 타이머** + 5분/15분 휴식
- ▶️ **시작/일시정지/리셋** 컨트롤
- 🔔 **알림 소리** - 타이머 완료 시 차임 소리
- 📊 **통계** - 오늘 완료한 포모도로 수 & 총 완료 수 (로컬 저장)
- 📱 **반응형 디자인** - 모바일/태블릿/데스크탑 지원

## 실행 방법

### 방법 1: 직접 열기
`index.html` 파일을 브라우저에서 직접 열기

### 방법 2: 로컬 서버 사용 (권장)
```bash
# Python 3
python -m http.server 8000

# 또는 npx
npx serve .
```

그 후 브라우저에서 `http://localhost:8000` 접속

## 파일 구조

```
pomodoro-ken/
├── index.html    # 메인 HTML
├── styles.css    # 스타일시트
├── app.js        # 타이머 로직
└── README.md     # 이 파일
```

## 브라우저 지원

- ✅ Chrome
- ✅ Safari
- ✅ Firefox
- ✅ Edge

## 라이선스

MIT

