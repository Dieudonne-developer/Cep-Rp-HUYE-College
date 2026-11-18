import React from 'react'
import { getApiBaseUrl } from '../utils/api'

export default function AboutPage() {
  const baseUrl = getApiBaseUrl()
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-10">
      <div className="w-full flex justify-center mb-6">
        <img
          src={`${baseUrl}/api/assets/logo`}
          alt="CEP RP Huye Logo"
          className="h-28 w-auto object-contain"
        />
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 text-center">
        CEP RP Huye – The Pentecostal Students’ Community at RP Huye College
      </h2>
      <div className="space-y-4 text-gray-800 leading-7">
        <p>
          CEP RP Huye (Communauté des Étudiants Pentecôtistes à RP Huye) is a fellowship of Pentecostal students who
          serve and worship God at RP Huye College. The community was founded in 2015, when new students joined the
          college and felt the need to create a place where they could worship freely and grow spiritually together.
        </p>
        <p>
          Among those students were three Pentecostals, including UWIZEYE Innocent, who were filled with the Holy Spirit
          and inspired to start a Christian fellowship on campus. They believed that the gift of salvation and the
          message of Christ within them should not be kept hidden. With this conviction, they began to meet for prayer,
          worship, and Bible study — and that is how CEP RP Huye was born.
        </p>
        <p>
          Over the years, the fellowship has continued to grow in both number and spiritual strength. More students have
          joined, finding in CEP RP Huye a spiritual home that helps them build their faith, develop their gifts, and
          share the love of Christ with others. Through the guidance of the Holy Spirit, the community has become a
          vibrant center of worship, prayer, and evangelism within the college.
        </p>
        <p>
          The main mission of CEP RP Huye is to expand God’s Kingdom within the campus through evangelism, worship,
          prayer, and acts of love. Members support each other spiritually, emotionally, and even academically. They
          visit the sick, pray for one another, and stand together as a true family in Christ.
        </p>
        <p>
          The community is built on strong Christian values — love, humility, service, and faithfulness. CEP RP Huye
          operates through different ministries such as choirs, worship teams, prayer groups, and social outreach teams,
          all working together to glorify God and strengthen the body of Christ.
        </p>
        <p>
          Today, CEP RP Huye has had a powerful impact on the lives of many students at RP Huye College. Those who have
          been part of the fellowship are known for their integrity, faith, and passion for serving God wherever they
          go. The community continues to conduct evangelism, prayer sessions, charity work, and discipleship programs,
          all aimed at transforming lives and making true disciples of Jesus Christ.
        </p>
        <p>
          CEP RP Huye remains a shining light at RP Huye College — a place where students are nurtured in faith, trained
          to lead with Christian values, and inspired to live for Christ both on campus and beyond.
        </p>
      </div>
    </div>
  )
}


