package com.kotlinacademy.taskflow.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * A free, public demo API (https://dummyjson.com/docs/todos) used for the "Import sample tasks"
 * feature. Retrofit generates the implementation of this interface at runtime.
 */
interface TodoApi {
    @GET("todos")
    suspend fun getTodos(@Query("limit") limit: Int = 10): TodosResponse

    companion object {
        const val BASE_URL = "https://dummyjson.com/"
    }
}

/** Network DTOs mirror the JSON exactly; unknown fields are ignored by our Json configuration. */
@Serializable
data class TodosResponse(val todos: List<TodoDto>)

@Serializable
data class TodoDto(
    val id: Int,
    val todo: String,
    val completed: Boolean,
)
