import path from 'path'

import {
  abeExtend,
  Manager,
  config,
  coreUtils,
  cmsData,
  cmsOperations
} from '../../'

const duplicate = function(oldPostUrl, template, newPath, name, req, isUpdate = false) {
  const p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforeDuplicate', oldPostUrl, template, newPath, name, req, isUpdate)

    let json = {}
    let revisions = []
    const newPostUrl = path.join(newPath, name) + '.' + config.files.templates.extension
    if(oldPostUrl != null) {
      const files = Manager.instance.getList()
      const oldPostDataPath = path.join(config.root, config.data.url, oldPostUrl.replace('.' + config.files.templates.extension, '.json'))
console.log(oldPostDataPath)
      let posts = []
      posts = coreUtils.array.filter(files, 'path', oldPostDataPath)
console.log(posts)
      if(posts.length > 0 && posts[0].revisions != null) {
        revisions = posts[0].revisions
        if(revisions != null && revisions[0] != null) {
          json = cmsData.file.get(revisions[0].path)
          delete json.abe_meta
        }
      }
    }

    abeExtend.hooks.instance.trigger('afterDuplicate', json, oldPostUrl, template, newPath, name, req, isUpdate)

    var pCreate = cmsOperations.create(template, newPath, name, req, json, (isUpdate) ? false : true)
    pCreate.then((resSave) => {
      if (isUpdate && oldPostUrl !== newPostUrl) {
        abeExtend.hooks.instance.trigger('beforeUpdate', json, oldPostUrl, template, newPath, name, req, isUpdate)
        cmsOperations.remove.remove(oldPostUrl)
      }
      resolve(resSave)
    },
    () => {
      reject()
    }).catch(function(e) {
      console.error('[ERROR] abe-duplicate.js', e)
      reject()
    })
  })

  return p
}

export default duplicate