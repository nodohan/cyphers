# 가져올 이미지를 정의
FROM node:20

# pnpm을 글로벌로 설치
#RUN npm cache clean --force && npm install

# 경로 설정하기
WORKDIR /src

COPY . .

EXPOSE 8082

# start 스크립트 실행
CMD ["npm", "start"]