import { Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './signUp.signIn/registerDto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>){    
    }


    async findUserById(id:string){
        return await this.userRepository.findOneBy({id})
    }
    async findUserByUsername(username:string){
        return await this.userRepository.findOne({where:{user_name:username}})
    }
     async findUserByEmail(email:string){
        return await this.userRepository.findOneBy({email})
    }

     async createUser(data:Partial<RegisterDto>){
        const user = this.userRepository.create(data)
        return await this.userRepository.save(user)
    }


     async deleteUser(id:string){
        return await this.userRepository.delete(id)
    }
}

