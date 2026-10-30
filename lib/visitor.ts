// A random id kept in this browser so the admin dashboard can count visitors and tell feedback apart. It holds no name or email and is
// never joined to a person unless they are signed in. A browser that blocks storage simply gets none.
export function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem("shiftlab.vid.v1");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("shiftlab.vid.v1", id);
    }
    return id;
  } catch {
    return undefined;
  }
}
