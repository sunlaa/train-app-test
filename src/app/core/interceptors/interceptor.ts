import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

export function interceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const token = localStorage.getItem('token');

  if (token) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${token}`),
    });
    return next(newReq);
  }

  return next(req);
}
