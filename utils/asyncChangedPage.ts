export const setPageAsyncChanged  = ()=>{
    document.cookie = "changed=true"
}

export const clearPageAsyncChanged = ()=>{
    document.cookie = "changed=false"
}

export const isPageAsyncChanged = ()=>{
    var name = "changed=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
    {
        var c = ca[i].trim();
        if (c.indexOf(name)==0){
            if(c.substring(name.length,c.length)==='true'){
                console.log('true')
                return true;
            }
            
        }
    }
    return false;
}