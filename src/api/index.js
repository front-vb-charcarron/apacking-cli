// let domain = '';

// if (process.env.NODE_ENV == 'production') {
//     domain = 'http://cargo.9-leaf.com';
// } else {
//     domain = '/api';
// }

// export const api_query_service = params => {
//     return $.post( domain + '/index.php/_api/Services/query_service', params);
// };

export const api_test = params => {
    return $.post('127.0.0.1/add/archive');
}