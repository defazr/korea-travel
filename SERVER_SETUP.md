# Server Setup Guide

서버: 141.164.41.235 (Vultr Ubuntu 22.04)

## 1. 레포 클론

```bash
ssh root@141.164.41.235
cd /var/www
git clone https://github.com/defazr/korea-travel.git
cd korea-travel
```

## 2. PostgreSQL 설치 + DB 생성

```bash
apt update && apt install postgresql -y
sudo -u postgres psql -f src/db/schema.sql
```

## 3. Python 의존성 설치

```bash
apt install python3-pip -y
pip3 install -r scripts/requirements.txt
```

## 4. 환경변수 설정

```bash
cp .env.example .env
nano .env
```

`.env` 파일에 입력:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=korea_travel
DB_USER=postgres
DB_PASSWORD=여기에_비밀번호_입력

TOURAPI_KEY=여기에_투어API_키_입력
```

## 5. 크롤러 실행

```bash
export TOURAPI_KEY="your_key"
python3 scripts/fetch_area_list.py
python3 scripts/fetch_detail_common.py
python3 scripts/fetch_detail_intro.py
python3 scripts/fetch_images.py
```

## 6. Node.js 설치 (없는 경우)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

## 7. Next.js 빌드 및 실행

```bash
npm install
npm run build
npm start
```

## 8. Cron 설정 (매일 새벽 3시 데이터 업데이트)

```bash
crontab -e
```

추가:

```
0 3 * * * cd /var/www/korea-travel && python3 scripts/update_data.py >> /var/www/korea-travel/logs/update.log 2>&1
```

로그 폴더 생성:

```bash
mkdir -p /var/www/korea-travel/logs
```
