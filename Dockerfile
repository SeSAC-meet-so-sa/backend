# 1. Node.js 기반 이미지 사용
FROM node:20
# 2. 앱 디렉토리 설정
WORKDIR /usr/src/app
# 3. 패키지 매니저 설치 (yarn 사용)
COPY package.json yarn.lock ./
# 4. 의존성 설치
RUN yarn install --production
# 5. 소스 코드 복사
COPY . .
# 6. Nest.js 애플리케이션 빌드
RUN yarn build
# 7. 애플리케이션 실행 환경
EXPOSE 3000
# 8. 프로덕션 실행 명령어
CMD ["yarn", "start:prod"]