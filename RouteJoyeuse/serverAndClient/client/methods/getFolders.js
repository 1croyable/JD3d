import axios from 'axios';

async function getFolders(name){
    return new Promise((resolve, reject) => {
        try{
            axios.get(`/api/getFolders?name=${name}`).then((response) => {
                return resolve(response.data);
            })
        }
        catch(err){
            alert(err);
        }
    })
}

export default getFolders;