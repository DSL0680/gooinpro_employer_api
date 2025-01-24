import express from 'express';
import connectMongoDB from './src/config/mongoDB.js';
import models from './src/models/index.js';
import employerRoutes from "./src/routes/employerRoutes.js";
import corsConfig from "./src/security/CustomSecurityConfig.js";
import bodyParser from 'body-parser';  // 요청 본문을 처리하기 위한 body-parser 모듈
import http from 'http';  // HTTP 서버 생성 모듈
import ChatRoutes from './src/routes/ChatRoutes.js';  // 채팅 관련 라우터 불러오기
import { configureSocket } from './src/socket/socketIoConfig.js';  // 분리한 소켓 설정 모듈 임포트
import chatRoomRoutes from './src/routes/ChatRoomRoutes.js';
import mapRoutes from './src/routes/MapRoutes.js';
import dotenv from 'dotenv';

// MongoDB 연결
connectMongoDB();

// .env 연결
dotenv.config();

const { Employer } = models;

const app = express();  // express 애플리케이션 생성
const server = http.createServer(app);  // HTTP 서버 생성
const io = configureSocket(server);  // WebSocket 설정 호출

const PORT = 3000;  // 서버 포트

// 서버 설정
app.use(bodyParser.json());  // JSON 형식의 요청 본문 처리
app.use(express.json());  // Express에서 JSON 처리

app.use('/employer/api/v1/chatmessage', ChatRoutes(io));  // 채팅 메세지 라우터 설정
app.use('/employer/api/v1/chatroom', chatRoomRoutes); // 채팅룸 라우터 설정

// CORS 미들웨어 적용
app.use(corsConfig);
// 라우트 설정
app.use('/employer/api/v1/login', employerRoutes);
// 미들웨어 설정
app.use(express.json());

// maps 라우터 연결
app.use('/api/map', mapRoutes);

// '/employers' 경로로 Employer 데이터 조회
app.get('/employers', async (req, res) => {
    try {
        const employers = await Employer.findAll();
        res.json(employers);  // 조회된 데이터를 JSON 형식으로 반환
    } catch (err) {
        console.error('Employer 조회 실패:', err);
        res.status(500).send('서버 오류');
    }
});

// 기본 라우터 예시
app.get('/', (req, res) => {
    res.send('Hello, Node.js!');
});

// 서버 포트 설정
// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);  // 서버 시작 로그
});