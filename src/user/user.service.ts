import { Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm'
import { UpdateUserDto } from './dto/update-user.dto';
import { registerDto } from '../auth/register.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>){    
    }

     findUserById(id:string){
        return this.userRepository.findOneBy({id})
    }
    findUserByEmail(email:string){
        return this.userRepository.findOneBy({email})
    }

    createUser(data:Partial<registerDto>){
        const user = this.userRepository.create(data)
        return this.userRepository.save(user)
    }

    async updateUser( id:string, data:UpdateUserDto ):Promise<User>{
        const user = await this.userRepository.findOne({where:{id}})
        if (!user) throw new NotFoundException(`User with id:${id} not found`)
        
        Object.assign(user,data)
        return this.userRepository.save(user)
    }

    deleteUser(id:string){
        return this.userRepository.delete(id)
    }
}

