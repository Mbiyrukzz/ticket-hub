export const buildCommentTree = (comments) => {
  const map = {}
  const roots = []

  comments.forEach((comment) => {
    comment.replies = []
    map[comment.id] = comment
  })

  comments.forEach((comment) => {
    if (comment.parentId) {
      map[comment.parentId]?.replies.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return roots
}
