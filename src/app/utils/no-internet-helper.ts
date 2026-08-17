import Swal from 'sweetalert2';

export class NoInternetHelper {
  static internet() {
    Swal.fire({
      title: 'OUPS !',
      text: 'Pas de connexion internet !',
      icon: 'question',
      timer: 4000,
      allowOutsideClick: false,
      showConfirmButton: false,
    });
  }
}
