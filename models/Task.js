import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema( 
    {
        title:{
            type: String,
            required: true,
            maxLength: 30,
        },
        description: {
            type: String
        },
        isComplete: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true, //updateAt, CreateAt 자동관리
    }, //여기 까지 스키마 정의
);

const Task = mongoose.model('Task', TaskSchema) //스키마를 기반으로 객체를 생성, 조회 수정, 삭제 하는 인터페이스
                            //mongodb에서 다룰 컬렉션 이름 tasks라는 컬렉션에 데이터를 추가, 조회, 등등
export default Task;