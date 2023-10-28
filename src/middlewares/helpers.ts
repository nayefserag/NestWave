export class Helpers{
public static async extractHashtags(text) {
  const hashtagRegex = /#(\w+)/g;
  return Array.from(text.matchAll(hashtagRegex), (match) => match[1]);
}
}