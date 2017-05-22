// urlParams is null when used for embedding
window.urlParams = window.urlParams || {};

// Public global variables
window.MAX_REQUEST_SIZE = window.MAX_REQUEST_SIZE  || 10485760;
window.MAX_AREA = window.MAX_AREA || 10000 * 10000;

// URLs for save and export
window.BASE_URL = window.BASE_URL || 'http://127.0.0.1:3000';

window.EXPORT_URL = window.EXPORT_URL || window.BASE_URL + '/export';
// window.SAVE_URL = window.SAVE_URL || window.BASE_URL + '/save';
window.OPEN_URL = window.OPEN_URL || window.BASE_URL + '/open';

window.SAVE_VIEWER_URL = window.SAVE_VIEWER_URL || window.BASE_URL + '/viewer/save';
window.GET_URL = window.GET_URL || '/get';
window.SAVE_URL = window.SAVE_URL || '/save';

window.GET_ACTION = window.GET_ACTION || '/get';
window.SAVE_ACTION = window.SAVE_ACTION || '/save';
window.UPDATE_ACTION = window.UPDATE_ACTION || '/update';
window.SAVE_IMG = window.SAVE_IMG || '/saveImg';
window.MODEL_COLLECTION =window.MODEL_COLLECTION || '/model';
window.MODELCLASS_COLLECTION =window.MODELCLASS_COLLECTION || '/modelClass';
window.VIEWER_COLLECTION =window.VIEWER_COLLECTION || '/viewer';

window.RESOURCES_PATH = window.RESOURCES_PATH || 'resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || window.RESOURCES_PATH + '/grapheditor';
window.STENCIL_PATH = window.STENCIL_PATH || 'stencils';
window.IMAGE_PATH = window.IMAGE_PATH || 'images';
window.UPLOADIMAGE_PATH = window.UPLOADIMAGE_PATH || 'uploadImg';
window.STYLE_PATH = window.STYLE_PATH || 'styles';
window.CSS_PATH = window.CSS_PATH || 'styles';
window.OPEN_FORM = window.OPEN_FORM || 'open.html';

// Sets the base path, the UI language via URL param and configures the
// supported languages to avoid 404s. The loading of all core language
// resources is disabled as all required resources are in grapheditor.
// properties. Note that in this example the loading of two resource
// files (the special bundle and the default bundle) is disabled to
// save a GET request. This requires that all resources be present in
// each properties file since only one file is loaded.
window.mxBasePath = window.mxBasePath || 'src';
window.mxLanguage = window.mxLanguage || urlParams['lang'];
window.mxLanguages = window.mxLanguages || ['de'];
