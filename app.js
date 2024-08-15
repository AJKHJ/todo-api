import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import Task from './models/Task.js';

const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.DATABASE_URL).then(() => console.log('Connected to DB'));

function asyncHandler(handler){ //asyncHandler함수는 라우터에 들어가는 함수를 파라미터로 받아서 또다른 handler 함수를 리턴함
  return async function (req, res){ //리턴하는 handler 함수는 파라미터로 전달되는 핸들러함수와 똑같은데, 추가적으로 오류처리가 가능한 함수
    try{
      await handler(req, res);
    }catch(e){
      if(e.name === 'ValidationError'){
        res.status(400).send({ message: e.message});
      }else if (e.name === 'CastError'){
        res.status(404).send({ message: 'Cannot find given id.' });
      }else{
        res.status(500).send({ message: e.message});
      }
    }
  }
}
app.get('/tasks', asyncHandler(async (req , res) => {
    /*
     * 쿼리 파라미터
     * - sort : 'oldest'인 경우 오래된 테스크 기준, 나머지 경우 새로운 태스크 기분
     * - count : 태스크 개수 
    */
   const sort = req.query.sort;
   const count = Number(req.query.count) || 0;

   const sortOption = { 
    createdAt: sort === 'oldest' ? 'asc' : 'desc'
  };
   const tasks = await Task.find().sort(sortOption).limit(count); //find는 여러객체 가져옴
                                              //find sort limit 다 쿼리를 리턴하기 때문에 연결해서 메소드 사용 가능
  res.send(tasks)
}));

app.get('/tasks/:id', asyncHandler(async (req, res) => { //:id = 변경되는 값 URL 파라미터. 함수안에 awiat 쓰기위해 async
  const id = req.params.id; //mongodb에선 id가 문자열 이므로 number 없앰
  const task = await Task.findById(id);  //await으로 결과값 받아옴. 주어진 객체 id 한개의 정보만 가져옴
  if(task){  //있으면 입력한 id값 출력
     res.send(task);
  } else{ //없으면 404
      res.status(404).send({ message : 'Cannot find given id.' });
  }
}));

app.post('/tasks', asyncHandler(async (req, res) => {
  const newTask = await Task.create(req.body); //body 내용 자동으로 추가~
  res.status(201).send(newTask);
}));

app.patch('/tasks/:id', asyncHandler(async (req, res) => { //:id = 변경되는 값 URL 파라미터. 함수안에 awiat 쓰기위해 async
  const id = req.params.id; //mongodb에선 id가 문자열 이므로 number 없앰
  const task = await Task.findById(id);  //await으로 결과값 받아옴. 주어진 객체 id 한개의 정보만 가져옴
  if(task){  //있으면 입력한 id값 출력
     Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
     });
     await task.save(); //수정된 값 저장 !!
     res.send(task);
  } else{ //없으면 404
      res.status(404).send({ message : 'Cannot find given id.' });
  }
}));

app.delete('/tasks/:id', asyncHandler(async (req, res) => { //:id = 변경되는 값 URL 파라미터.
  const id = req.params.id; //params의 프로퍼티로 URL의 파라미터들이 저장 됨.
  const task = await Task.findByIdAndDelete(id);
  if(task){ 
    res.sendStatus(204);
  }
  else{ //없으면 404
      res.status(404).send({ message : 'Cannot find given id.' });
  }
}));

app.listen(process.env.PORT || 3000, () => console.log('Server Started'));