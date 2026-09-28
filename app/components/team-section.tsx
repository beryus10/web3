import Image from "next/image";

const teamMembers = [
  {
    name: "James Wilson",
    role: "CEO & Founder",
    image: "/images/ceo.jpeg",
  },
  {
    name: "Sarah Chen",
    role: "Head of Analysis",
    image: "/images/sarah_chen.avif",
  },
  {
    name: "Michael Ross",
    role: "Chief Technology Officer",
    image: "/images/micheal_ross.avif",
  },
];

export function TeamSection({ id }: { id?: string }) {
  return (
    <section aria-labelledby="team-title" className="lv-team" id={id}>
      <div className="lv-container">
        <div className="lv-section-heading">
          <p className="lv-label">Our experts</p>
          <h2 id="team-title">Meet Our Team</h2>
          <p>The minds behind your financial success.</p>
        </div>
        <div className="lv-team-grid">
          {teamMembers.map((member) => (
            <article className="lv-team-member" key={member.name}>
              <div className="lv-team-image">
                <Image
                  alt={`${member.name}, ${member.role}`}
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 800px) 50vw, 33vw"
                  src={member.image}
                />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}