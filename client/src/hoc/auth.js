import React,{useEffect} from 'react'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';
import { response } from 'express';

export default function(SpecificComponent, option, adminRoute = null) {

    // null => 아무나 출입 가능한 페이지
    // true => 로그인한 유저만 출입 가능 페이지
    // false => 로그인한 유저는 출입 불가 페이지

    function AuthenticationCheck(props) {

        const dispatch = useDispatch()

        useEffect(() => {

            dispatch(auth()).then(response => {
                console.log(response)
            })                             

        }, [])
    }

    return AuthenticationCheck
} 