/**
 * MemberService 单元测试
 * 测试成员删除功能的各种场景
 */

import MemberService from '../services/MemberService.js'

// 测试套件
describe('MemberService 删除功能测试', () => {
  let state
  let service
  let colorPalette

  // 每个测试前初始化
  beforeEach(() => {
    colorPalette = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c']
    state = {
      users: [
        { name: '张三', score: 100, color: colorPalette[0] },
        { name: '李四', score: 200, color: colorPalette[1] },
        { name: '王五', score: 300, color: colorPalette[2] }
      ]
    }
    service = new MemberService(state, colorPalette)
  })

  // 测试正常删除
  test('正常删除成员', () => {
    const initialCount = state.users.length
    const deletedMember = service.deleteMember(1)

    expect(deletedMember).not.toBeNull()
    expect(deletedMember.name).toBe('李四')
    expect(state.users.length).toBe(initialCount - 1)
    expect(state.users.find(u => u.name === '李四')).toBeUndefined()
  })

  // 测试删除第一个成员
  test('删除第一个成员', () => {
    const deletedMember = service.deleteMember(0)

    expect(deletedMember.name).toBe('张三')
    expect(state.users[0].name).toBe('李四')
  })

  // 测试删除最后一个成员
  test('删除最后一个成员', () => {
    const initialCount = state.users.length
    const deletedMember = service.deleteMember(initialCount - 1)

    expect(deletedMember.name).toBe('王五')
    expect(state.users.length).toBe(initialCount - 1)
  })

  // 测试删除唯一成员时抛出错误
  test('删除唯一成员时应抛出错误', () => {
    state.users = [{ name: '唯一成员', score: 100, color: colorPalette[0] }]

    expect(() => {
      service.deleteMember(0)
    }).toThrow('至少需要保留一名成员')
  })

  // 测试删除无效索引
  test('删除负索引时应抛出错误', () => {
    expect(() => {
      service.deleteMember(-1)
    }).toThrow('索引 -1 超出范围')
  })

  // 测试删除超出范围的索引
  test('删除超出范围的索引时应抛出错误', () => {
    expect(() => {
      service.deleteMember(10)
    }).toThrow('索引 10 超出范围')
  })

  // 测试删除非数字索引
  test('删除非数字索引时应抛出错误', () => {
    expect(() => {
      service.deleteMember('invalid')
    }).toThrow('无效的索引参数')
  })

  // 测试删除后数据一致性
  test('删除后数据一致性', () => {
    const initialUsers = [...state.users]
    const deletedIndex = 1

    service.deleteMember(deletedIndex)

    // 验证其他成员数据未被修改
    expect(state.users[0]).toEqual(initialUsers[0])
    expect(state.users[1]).toEqual(initialUsers[2])
  })

  // 测试事务回滚
  test('删除失败时应该回滚', () => {
    // 模拟删除过程中的错误
    const originalSplice = state.users.splice
    state.users.splice = function(...args) {
      // 模拟 splice 返回空数组（异常情况）
      return []
    }

    const initialUsers = [...state.users]

    expect(() => {
      service.deleteMember(1)
    }).toThrow('删除操作失败')

    // 验证数据回滚
    expect(state.users).toEqual(initialUsers)

    // 恢复 splice
    state.users.splice = originalSplice
  })

  // 测试连续删除
  test('连续删除多个成员', () => {
    // 删除第二个成员
    service.deleteMember(1)
    expect(state.users.length).toBe(2)
    expect(state.users.find(u => u.name === '李四')).toBeUndefined()

    // 删除第一个成员（原第三个成员）
    service.deleteMember(0)
    expect(state.users.length).toBe(1)
    expect(state.users[0].name).toBe('王五')
  })

  // 测试删除后的索引变化
  test('删除后索引重新排列', () => {
    service.deleteMember(0)

    // 原索引1的成员现在应该在索引0
    expect(state.users[0].name).toBe('李四')
    
    // 原索引2的成员现在应该在索引1
    expect(state.users[1].name).toBe('王五')
  })

  // 边界条件：删除边界索引
  test('边界条件 - 删除边界索引', () => {
    // 删除索引0（边界）
    let result = service.deleteMember(0)
    expect(result).not.toBeNull()

    // 重置状态
    state.users = [
      { name: '张三', score: 100, color: colorPalette[0] },
      { name: '李四', score: 200, color: colorPalette[1] },
      { name: '王五', score: 300, color: colorPalette[2] }
    ]

    // 删除最后一个索引（边界）
    const lastIndex = state.users.length - 1
    result = service.deleteMember(lastIndex)
    expect(result).not.toBeNull()
    expect(result.name).toBe('王五')
  })

  // 性能测试：大量成员删除
  test('性能测试 - 大量成员删除', () => {
    // 生成大量成员
    state.users = []
    for (let i = 0; i < 100; i++) {
      state.users.push({
        name: `成员${i}`,
        score: i * 10,
        color: colorPalette[i % colorPalette.length]
      })
    }

    const startTime = Date.now()

    // 删除50个成员
    for (let i = 0; i < 50; i++) {
      service.deleteMember(0)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    expect(state.users.length).toBe(50)
    expect(duration).toBeLessThan(1000) // 应该在1秒内完成
  })
})

// 运行测试
console.log('开始运行 MemberService 删除功能测试...')
