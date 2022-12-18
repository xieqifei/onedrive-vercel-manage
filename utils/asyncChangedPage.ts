export const setPageAsyncChanged  = ()=>{
    window.addEventListener('popstate', (e) => {
        window.location.reload()
      })
}

