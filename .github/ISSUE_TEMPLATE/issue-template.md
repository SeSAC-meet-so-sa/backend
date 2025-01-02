---
name: issue template
about: normal issues
title: ''
labels: ''
assignees: nowgnoesiohc

---

### 📝 Issue
- 회원 가입 및 로그인 기능 구현

### 📋 Tasks
1. TODO1
  - 사용자 데이터 DB에 저장
  - 비밀번호 해싱 -> 보안 강화
  - 중복 사용자 검증 logic
2. TODO2
  -  사용자가 입력한 비밀번호를 데이터베이스의 해시된 비밀번호와 비교
  - JWT 기반 인증 토큰 발급

### ✅ Checklist
- [x] 회원가입 API (`POST /auth/signup`) 구현
- [x] 로그인 API (`POST /auth/login`) 구현
- [x] JWT 토큰 생성 및 반환
- [x] 환경 변수(`JWT_SECRET`, `MONGO_URI`) 적용

### 📌 References
- [NestJS Documentation: Authentication](https://docs.nestjs.com/security/authentication)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js#readme)
