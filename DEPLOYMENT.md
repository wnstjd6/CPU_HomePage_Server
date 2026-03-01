# CPU 프로젝트 배포 가이드 (Docker 미사용)

## 내 서버 빠른 연결 (Cafe24: 172.235.192.201 / cpu.it.kr)

### 1) 서버 접속
```bash
ssh root@172.235.192.201
```

### 2) 코드 받기
```bash
cd /root
git clone <your-repository> cpu
cd cpu
```

이미 코드가 있으면:
```bash
cd /root/cpu
git pull origin main
```

### 3) 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 예시:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://cpu.it.kr,http://172.235.192.201
```

### 4) 앱 실행(PM2)
```bash
npm ci
npm run build
npm install -g pm2
pm2 start ecosystem.config.cjs --update-env || pm2 restart cpu-api --update-env
pm2 save
```

### 5) Nginx 연결
```bash
apt update
apt install -y nginx
cp deploy/nginx/cpu.it.kr.conf /etc/nginx/sites-available/cpu.it.kr
ln -sf /etc/nginx/sites-available/cpu.it.kr /etc/nginx/sites-enabled/cpu.it.kr
nginx -t
systemctl reload nginx
```

### 6) HTTPS 적용
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d cpu.it.kr
```

### 7) 확인
```bash
pm2 status
curl http://172.235.192.201/question
curl https://cpu.it.kr/question
```

---

## 개발 환경에서 실행

### 1. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 자신의 환경에 맞게 수정합니다:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=cpu
DB_PASSWORD=your_db_password
DB_NAME=cpu
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## 서버 배포 (Node.js 직접 실행)

### 1. 서버에 코드 배포
```bash
git clone <your-repository> cpu
cd cpu
```

### 2. Node.js 준비
```bash
node -v
npm -v
```

Node.js가 없다면 nvm으로 설치합니다:
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 서버 환경에 맞게 수정합니다:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=cpu
DB_PASSWORD=<stu11-db-password>
DB_NAME=cpu
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://cpu.it.kr
```

### 4. 빌드 및 실행
```bash
npm ci
npm run build
nohup npm run start:prod > app.log 2>&1 &
```

### 4-1. PM2로 백그라운드 실행 (권장)
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 5. 상태 확인
```bash
tail -n 100 app.log
curl http://172.235.192.201/question
```

### 6. 도메인 연결 (Nginx)
```bash
sudo apt update
sudo apt install -y nginx
sudo cp deploy/nginx/cpu.it.kr.conf /etc/nginx/sites-available/cpu.it.kr
sudo ln -s /etc/nginx/sites-available/cpu.it.kr /etc/nginx/sites-enabled/cpu.it.kr
sudo nginx -t
sudo systemctl reload nginx
```

### 7. HTTPS 적용 (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cpu.it.kr
sudo systemctl status certbot.timer
```

---

## Docker로 배포

### 1. 사전 준비
- 서버에 Docker와 Docker Compose가 설치되어 있어야 합니다.

### 2. 코드 배포
```bash
git clone <your-repository> cpu
cd cpu
```

### 3. Docker 환경 변수 설정
```bash
cp .env.docker.example .env.docker
```

`.env.docker`에서 최소한 아래 항목을 운영값으로 수정하세요:
```env
DB_PASSWORD=<strong-password>
MYSQL_ROOT_PASSWORD=<strong-root-password>
CORS_ORIGIN=https://cpu.it.kr
```

### 4. 컨테이너 실행
```bash
docker compose --env-file .env.docker up -d --build
```

### 5. 상태 확인
```bash
docker compose ps
docker compose logs -f api
curl http://172.235.192.201/question
```

### 6. 재배포(코드 업데이트)
```bash
git pull origin main
docker compose --env-file .env.docker up -d --build
```

### 참고
- `DB_SYNCHRONIZE=true`는 초기 구성에 편리하지만 운영 안정성을 위해 나중에는 `false` + 마이그레이션 방식으로 전환을 권장합니다.

---

## 카페24 배포 가이드

### 0. 먼저 상품 유형 확인
- 일반 웹호스팅(FTP/PHP 중심)만 지원하면 NestJS 백엔드 상시 실행이 어렵습니다.
- 반드시 SSH 접속 + Node.js 실행 가능한 상품(VPS/클라우드/매니지드 서버)을 사용하세요.

### 1. 서버 접속 확인
```bash
ssh root@172.235.192.201
```

접속 직후 확인:
```bash
whoami
uname -a
```

### 2. Node.js 20 준비
```bash
node -v
npm -v
```

Node.js가 없다면 nvm으로 설치:
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
node -v
```

### 3. 코드 배포
```bash
git clone <your-repository> cpu
cd cpu
```

이미 폴더가 있으면:
```bash
cd cpu
git pull origin main
```

### 4. 운영 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 권장 값:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://cpu.it.kr
```

### 5. 빌드 및 PM2 실행
```bash
npm ci
npm run build
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 6. Nginx 리버스 프록시
```bash
sudo apt update
sudo apt install -y nginx
sudo cp deploy/nginx/cpu.it.kr.conf /etc/nginx/sites-available/cpu.it.kr
sudo ln -s /etc/nginx/sites-available/cpu.it.kr /etc/nginx/sites-enabled/cpu.it.kr
sudo nginx -t
sudo systemctl reload nginx
```

도메인이 다르면 `deploy/nginx/cpu.it.kr.conf`의 `server_name`을 현재 도메인으로 바꾼 뒤 적용하세요.

### 7. HTTPS 적용
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cpu.it.kr
```

### 8. 동작 확인
```bash
pm2 status
pm2 logs cpu-api --lines 100
curl http://172.235.192.201/question
```

---

## API 엔드포인트

기본 주소:
- HTTP: `http://172.235.192.201`
- HTTPS: `https://cpu.it.kr`

### 지원하기 (Application)

#### 지원서 제출
```
POST /application
Content-Type: application/json

{
  "name": "홍길동",
  "studentId": "2024001",
  "phone": "01012345678",
  "email": "example@email.com",
  "isDormitory": true,
  "room": "301",
  "motivation": "동아리 활동을 통해...",
  "strengthWeakness": "강점: ..., 약점: ...",
  "expectedRole": "풀스택 개발자"
}
```

#### 모든 지원서 조회
```
GET /application
```

#### 특정 지원서 조회
```
GET /application/:id
```

#### 지원서 삭제
```
DELETE /application/:id
```

---

### Q&A (Question)

#### 질문 작성
```
POST /question
Content-Type: application/json

{
  "question": "질문 내용"
}
```

#### 모든 질문 조회
```
GET /question
```

#### 특정 질문 조회
```
GET /question/:id
```

#### 질문 답변 등록 (DB 직접 업데이트)
```sql
UPDATE questions
SET answer = '답변 내용'
WHERE id = 1;
```

#### 질문 삭제
```
DELETE /question/:id
```

---

## 로그 확인

```bash
tail -f app.log
```

---

## 문제 해결

### MySQL 연결 실패
- `.env`의 DB 접속 정보가 맞는지 확인
- DB 서버에서 접속 허용(호스트/방화벽) 상태 확인

### 포트 충돌
- `.env`에서 `PORT` 값을 변경
- 이미 실행 중인 프로세스 확인 후 재시작

### 프로세스 재시작
```bash
pkill -f "node dist/main" || true
nohup npm run start:prod > app.log 2>&1 &
```

---

## 프로덕션 체크리스트

- [ ] `.env` 비밀번호를 강력한 값으로 설정
- [ ] `NODE_ENV=production` 확인
- [ ] 데이터베이스 백업 설정
- [ ] HTTPS 설정 (Nginx/Let's Encrypt)
- [ ] 로그 로테이션 설정
