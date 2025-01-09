---
name: issue template
about: normal issues
title: "[FEAT] 이미지 업로드 기능 구현"
labels: ''
assignees: nowgnoesiohc

---

### 📝 Issue

**Title**
S3를 이용한 이미지 업로드 API 구현 <br/>
**Description**
클라이언트에서 이미지를 업로드 할 수 있는 API 구현.
이미지 업로드 시, 이미지의 URL을 반환하도록 한다.
해당 API는 업로드 된 이미지 처리, 파일 검증, S3 저장 및 URL 반환 기능 포함.

---

### 📋 Tasks
1. 환경 설정
    - [ ] AWS S3 버킷 생성
    - [ ] IAM 사용자 생성 및 권한 부여 (AmazonS3FullAccess)
    - [ ] .env 파일에 AWS 설정 추가:
2. NestJS 서버 구성
    - [ ] S3Service 작성:
        - 파일 업로드 로직
        - 업로드된 이미지의 URL 반환
    -  [ ] S3Controller 작성:
        - 이미지 업로드 엔드포인트 (POST /s3/upload)
        - 에러 처리 및 응답 형식 설정
    - [ ] DTO 작성:
        - 업로드 요청 시 메타데이터 구조 정의 (필요 시)
3. 파일 업로드 처리
    - [ ] multer를 사용하여 파일 처리
    - [ ] 이미지 파일의 형식 및 크기 검증
4. 테스트
    - [ ] Postman을 사용하여 API 테스트:
        - 이미지 업로드 성공 테스트
        - 잘못된 파일 형식/크기 업로드 시 에러 처리 확인
5. 코드 정리 및 문서화
    - [ ] S3 업로드 API 코드 정리
    - [ ] Notion API 문서에 작성 (/api/docs 경로)

### ✅ Checklist
- [ ] 이미지가 성공적으로 S3에 업로드되고, URL이 반환될 것
- [ ] 파일 형식 또는 크기 제한 조건 작동될 것
- [ ] 모든 주요 경로에 대한 테스트 완료할 것
- [ ] API 문서에 사용법 제시할 것

---
### 🎈 Information
**Labels**
`feature` `backend` `AWS` `S3` <br/>
**Assignees**
- Seongwon

### 📌 References
- [AWS S3로 이미지 업로드 하기(Soyoon Park Medium)](https://medium.com/@fluffy-puppy-lovely/nestjs-aws-s3%EB%A1%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%97%85%EB%A1%9C%EB%93%9C%ED%95%98%EA%B8%B0-05bc258fbca8)
- [Multer S3 연동 및 사용법 (Inpa Dev)](https://inpa.tistory.com/entry/AWS-SDK-%F0%9F%91%A8%F0%9F%8F%BB%E2%80%8D%F0%9F%92%BB-Multer-S3-%EC%97%B0%EB%8F%99-%EB%B0%8F-%EC%82%AC%EC%9A%A9%EB%B2%95-%EC%A0%95%EB%A6%AC)
