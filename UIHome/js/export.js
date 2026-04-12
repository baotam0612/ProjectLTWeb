export const fetchAPI= async (url) =>{
    const reponse= await fetch(url);
    const result= await Response.json();
    return result;
}