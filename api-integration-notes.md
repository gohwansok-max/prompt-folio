# CheapAI API 연동 확인 사항

- Base URL: `https://api.cheapai.im/v1`
- OpenAI 호환 Chat Completions는 `POST /chat/completions`와 `Authorization: Bearer csk_...` 형식을 사용한다.
- 권장 선택 모델은 GPT 계열 `gpt-5.6-sol`, Claude 계열 `claude-sonnet-5`이다.
- 입력을 모델에 전송하면 저장 보관함의 태그 후보만 JSON 배열로 돌려받도록 요청한다.
- 브라우저가 인증 헤더를 포함한 POST 요청을 직접 보내려면 API의 CORS 허용이 필요하다. `OPTIONS /v1/chat/completions` 응답에서 `Access-Control-Allow-Origin: *`, `authorization, content-type` 허용 헤더와 `POST` 허용을 확인했다. 정적 GitHub Pages 환경에서는 API 키가 소스에 포함되지 않도록 사용자의 브라우저 로컬 저장소에만 저장한다.
- 2026-08-21 모델 카탈로그 기준 1M 토큰 정가: `gpt-5.6-sol` 입력 ₩7,500·출력 ₩45,000, `claude-sonnet-5` 입력 ₩4,500·출력 ₩22,500이다. 태그 추천은 입력 추정치와 최대 160 출력 토큰으로 비용·크레딧을 사전 표시하며, 실제 차감은 API 응답 usage 기준으로 달라질 수 있다.
