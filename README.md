# Luna Harness 🌙

Anthropic의 [Harness Design](https://www.anthropic.com/engineering/harness-design-long-running-apps)에서 영감을 받은 3-에이전트 아키텍처.

OpenClaw 서브에이전트 기반으로 **Planner → Generator → Evaluator** 파이프라인을 구현합니다.

## 아키텍처

```
사용자: "북마크 매니저 만들어줘"
        ↓
   ① PLANNER
   - 1~4줄 아이디어 → 상세 제품 스펙 (SPEC.md)
   - 기술 세부사항보다 제품 컨텍스트에 집중
        ↓
   ② GENERATOR  
   - 스프린트 단위 구현 (한 기능씩)
   - React + Vite + FastAPI + SQLite
   - 매 스프린트 후 자체 점검
        ↓↑ (반복)
   ③ EVALUATOR
   - 실제 앱을 실행하고 테스트
   - 4가지 기준: 기능성, 디자인, 코드품질, 제품깊이
   - 기준 미달 → 상세 피드백 + 반려
```

## 핵심 원칙

- **만드는 놈 ≠ 평가하는 놈** — GAN에서 영감, 자기평가 편향 제거
- **스프린트 계약** — 코딩 전에 완료 조건 합의
- **파일 기반 소통** — 에이전트 간 SPEC.md, SPRINT.md, EVAL.md로 통신
- **컨텍스트 리셋** — 각 에이전트는 독립 세션으로 fresh start

## 사용법

OpenClaw 메인 세션에서:
```
"북마크 매니저 앱 만들어줘" → Luna가 자동으로 3-에이전트 파이프라인 실행
```

## 프로젝트

| 프로젝트 | 상태 | 설명 |
|----------|------|------|
| bookmark-manager | 🚧 진행중 | 첫 테스트 프로젝트 |

## 참고

- [Anthropic: Harness Design for Long-Running Apps](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [OpenClaw](https://github.com/openclaw/openclaw)
